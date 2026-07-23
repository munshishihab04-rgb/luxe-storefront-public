import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").replace(/^['\"]|['\"]$/g, "");
  }
}

loadDotEnv(path.join(rootDir, ".env"));
loadDotEnv(path.join(rootDir, ".env.local"));

const PORT = Number(process.env.PORT || 4173);
const XPAY_ENV = (process.env.XPAY_ENV || "test").toLowerCase();
const XPAY_ALIAS = process.env.XPAY_ALIAS || "";
const XPAY_SECRET_KEY = process.env.XPAY_SECRET_KEY || "";
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const XPAY_CURRENCY = process.env.XPAY_CURRENCY || "EUR";
const XPAY_LANGUAGE = process.env.XPAY_LANGUAGE || "ITA";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const catalogPath = path.join(rootDir, "data", "catalog.json");
const ordersDir = process.env.ORDERS_DIR ? path.resolve(process.env.ORDERS_DIR) : path.join(rootDir, "var", "orders");
const configuredPaymentRateLimit = Number(process.env.PAYMENT_RATE_LIMIT || 20);
const paymentRateLimit = Number.isSafeInteger(configuredPaymentRateLimit) && configuredPaymentRateLimit > 0 ? configuredPaymentRateLimit : 20;
const rateLimitWindowMs = 10 * 60 * 1000;
const pendingOrderTtlMs = 60 * 60 * 1000;
const failedOrderRetentionMs = 30 * 24 * 60 * 60 * 1000;
const rateLimitBuckets = new Map();

if (process.env.NODE_ENV === "production") {
  const configurationErrors = [];
  if (!PUBLIC_BASE_URL.startsWith("https://")) configurationErrors.push("PUBLIC_BASE_URL must use HTTPS");
  if (ADMIN_TOKEN.length < 32 || /change_me|example|placeholder/i.test(ADMIN_TOKEN)) configurationErrors.push("ADMIN_TOKEN must be a strong secret");
  if (XPAY_ENV !== "production") configurationErrors.push("XPAY_ENV must be production");
  if (!XPAY_ALIAS || /your_|example|placeholder/i.test(XPAY_ALIAS)) configurationErrors.push("XPAY_ALIAS is missing");
  if (XPAY_SECRET_KEY.length < 16 || /your_|example|placeholder/i.test(XPAY_SECRET_KEY)) configurationErrors.push("XPAY_SECRET_KEY is missing or too short");
  if (configurationErrors.length > 0) {
    throw new Error(`Invalid production configuration: ${configurationErrors.join("; ")}`);
  }
}

const xpayEndpoint = XPAY_ENV === "production"
  ? "https://ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet"
  : "https://int-ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet";

const pendingOrders = new Map();
let catalogScriptCache;

class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self)",
  "Cross-Origin-Opener-Policy": "same-origin",
};

function withSecurityHeaders(headers = {}) {
  return { ...securityHeaders, ...headers };
}

function clientAddress(req) {
  if (process.env.TRUST_PROXY === "true") {
    return String(req.headers["x-forwarded-for"] || "").split(",").at(-1)?.trim() || req.socket.remoteAddress || "unknown";
  }
  return req.socket.remoteAddress || "unknown";
}

function allowRequest(req, bucketName, limit) {
  const now = Date.now();
  if (rateLimitBuckets.size > 10_000) {
    for (const [bucketKey, bucket] of rateLimitBuckets) {
      if (bucket.resetAt <= now || rateLimitBuckets.size > 10_000) rateLimitBuckets.delete(bucketKey);
    }
  }
  const key = `${bucketName}:${clientAddress(req)}`;
  const current = rateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

function safeEqual(actual, expected) {
  const actualBuffer = Buffer.from(String(actual || ""));
  const expectedBuffer = Buffer.from(String(expected || ""));
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function escapeScriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function orderFilePath(orderId) {
  if (!/^LX-[0-9]+-[A-F0-9]{16}$/.test(String(orderId || ""))) return null;
  return path.join(ordersDir, `${orderId}.json`);
}

function persistOrder(order) {
  const filePath = orderFilePath(order.codTrans);
  if (!filePath) throw new Error("Invalid order ID");
  fs.mkdirSync(ordersDir, { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(order), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporaryPath, filePath);
}

function refreshOrderState(order) {
  const createdAt = Date.parse(order?.createdAt || "");
  if (order?.status === "pending" && Number.isFinite(createdAt) && Date.now() - createdAt > pendingOrderTtlMs) {
    order.status = "expired";
    order.updatedAt = new Date().toISOString();
    persistOrder(order);
    pendingOrders.set(order.codTrans, order);
  }
  return order;
}

function getOrder(orderId) {
  const cached = pendingOrders.get(orderId);
  if (cached) return refreshOrderState(cached);
  const filePath = orderFilePath(orderId);
  if (!filePath || !fs.existsSync(filePath)) return undefined;
  const order = refreshOrderState(JSON.parse(fs.readFileSync(filePath, "utf8")));
  pendingOrders.set(orderId, order);
  return order;
}

function activeOrders() {
  if (!fs.existsSync(ordersDir)) return [];
  const now = Date.now();
  const active = [];
  for (const entry of fs.readdirSync(ordersDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const filePath = path.join(ordersDir, entry.name);
    try {
      const order = refreshOrderState(JSON.parse(fs.readFileSync(filePath, "utf8")));
      const updatedAt = Date.parse(order.updatedAt || order.createdAt || "");
      if (["failed", "expired"].includes(order.status) && Number.isFinite(updatedAt) && now - updatedAt > failedOrderRetentionMs) {
        fs.unlinkSync(filePath);
        pendingOrders.delete(order.codTrans);
        continue;
      }
      if (order.status === "pending" || order.status === "paid") active.push(order);
    } catch (error) {
      console.error(`Unable to read order file ${entry.name}`, error);
    }
  }
  return active;
}

function activeReservationTotals() {
  const totals = new Map();
  for (const order of activeOrders()) {
    for (const item of order.items) {
      const key = `${item.productId}\u0000${item.variantId || ""}`;
      totals.set(key, (totals.get(key) || 0) + Number(item.quantity || 0));
    }
  }
  return totals;
}

function loadCatalog() {
  if (!fs.existsSync(catalogPath)) return { products: [], categories: [], brands: [], updatedAt: null };
  return JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
}

function saveCatalog(catalog) {
  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  const normalized = {
    products: Array.isArray(catalog.products) ? catalog.products : [],
    categories: Array.isArray(catalog.categories) ? catalog.categories : [],
    brands: Array.isArray(catalog.brands) ? catalog.brands : [],
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(catalogPath, JSON.stringify(normalized, null, 2));
  return normalized;
}

function requireAdmin(req, res) {
  if (!ADMIN_TOKEN) return true;
  if (safeEqual(req.headers["x-admin-token"], ADMIN_TOKEN)) return true;
  json(res, 401, { ok: false, error: "ADMIN_TOKEN_REQUIRED", message: "Inserisci il token admin." });
  return false;
}

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, withSecurityHeaders({
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  }));
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 250_000) {
        reject(new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function signStartPayment({ codTrans, amountCents, divisa }) {
  // Nexi/XPay Classic hosted payment MAC formula:
  // codTrans=<id>divisa=<currency>importo=<amount_in_cents><secret>
  const raw = `codTrans=${codTrans}divisa=${divisa}importo=${amountCents}${XPAY_SECRET_KEY}`;
  return crypto.createHash("sha1").update(raw).digest("hex");
}

function signResponse(params) {
  // Common XPay response MAC formula. If your Nexi contract uses a different
  // profile, adjust this in one place only.
  const raw = `codTrans=${params.codTrans || ""}esito=${params.esito || ""}importo=${params.importo || ""}divisa=${params.divisa || ""}data=${params.data || ""}orario=${params.orario || ""}codAut=${params.codAut || ""}${XPAY_SECRET_KEY}`;
  return crypto.createHash("sha1").update(raw).digest("hex");
}

function requiredText(value, field, maxLength = 200) {
  const text = String(value || "").trim();
  if (!text || text.length > maxLength) {
    throw new ApiError(400, "INVALID_ORDER", `Campo non valido: ${field}`);
  }
  return text;
}

function buildTrustedOrder(body) {
  const catalog = loadCatalog();
  const productsById = new Map(catalog.products.map((product) => [product.id, product]));
  const reservationTotals = activeReservationTotals();
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
    throw new ApiError(400, "INVALID_CART", "Il carrello non è valido.");
  }

  const aggregatedItems = new Map();
  for (const requestedItem of body.items) {
    const productId = requiredText(requestedItem?.productId, "productId", 120);
    const variantId = requestedItem?.variantId ? requiredText(requestedItem.variantId, "variantId", 120) : "";
    const quantity = Number(requestedItem.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new ApiError(400, "INVALID_QUANTITY", "Quantità non valida.");
    }
    const key = `${productId}\u0000${variantId}`;
    const existing = aggregatedItems.get(key);
    aggregatedItems.set(key, { productId, variantId: variantId || undefined, quantity: (existing?.quantity || 0) + quantity });
  }

  const items = [...aggregatedItems.values()].map((requestedItem) => {
    const productId = requiredText(requestedItem?.productId, "productId", 120);
    const product = productsById.get(productId);
    if (!product) throw new ApiError(400, "PRODUCT_NOT_FOUND", "Un prodotto non è più disponibile.");

    const quantity = Number(requestedItem.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "INVALID_QUANTITY", "Quantità non valida.");
    }
    if (product.stockStatus === "out_of_stock" || product.availability === "out of stock") {
      throw new ApiError(409, "OUT_OF_STOCK", `${product.title} non è disponibile.`);
    }

    let variant;
    if (requestedItem.variantId) {
      variant = product.variants?.find((candidate) => candidate.id === requestedItem.variantId);
      if (!variant || !variant.available) {
        throw new ApiError(409, "VARIANT_UNAVAILABLE", `La variante di ${product.title} non è disponibile.`);
      }
      const remainingStock = Number(variant.stock || 0) - (reservationTotals.get(`${product.id}\u0000${variant.id}`) || 0);
      if (remainingStock < quantity) {
        throw new ApiError(409, "VARIANT_UNAVAILABLE", `La quantità richiesta di ${product.title} non è disponibile.`);
      }
    } else if (product.variants?.some((candidate) => candidate.size)) {
      throw new ApiError(400, "VARIANT_REQUIRED", `Seleziona una variante per ${product.title}.`);
    }

    const unitPrice = Number(variant?.price ?? product.salePrice ?? product.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new ApiError(409, "INVALID_CATALOG_PRICE", "Prezzo prodotto non valido.");
    }

    return {
      productId: product.id,
      variantId: variant?.id,
      title: product.title,
      brand: product.brand,
      quantity,
      unitPrice,
      selectedSize: variant?.size,
      selectedColor: variant?.color,
    };
  });

  const shipping = body.shipping || {};
  const shippingMethod = shipping.method === "express" ? "express" : shipping.method === "standard" ? "standard" : null;
  if (!shippingMethod) throw new ApiError(400, "INVALID_SHIPPING", "Metodo di spedizione non valido.");
  const shippingCostCents = shippingMethod === "express" ? 1_200 : 0;
  const amountCents = items.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0) + shippingCostCents;
  if (!Number.isSafeInteger(amountCents) || amountCents < 100) {
    throw new ApiError(400, "INVALID_AMOUNT", "Totale ordine non valido.");
  }

  const customer = body.customer || {};
  const normalizedCustomer = {
    firstName: requiredText(customer.firstName, "firstName", 80),
    lastName: requiredText(customer.lastName, "lastName", 80),
    email: requiredText(customer.email, "email", 254).toLowerCase(),
    phone: requiredText(customer.phone, "phone", 40),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCustomer.email)) {
    throw new ApiError(400, "INVALID_EMAIL", "Email non valida.");
  }

  const normalizedShipping = {
    address: requiredText(shipping.address, "address", 200),
    city: requiredText(shipping.city, "city", 100),
    zip: requiredText(shipping.zip, "zip", 20),
    country: requiredText(shipping.country, "country", 80),
    method: shippingMethod,
  };

  return { amountCents, customer: normalizedCustomer, shipping: normalizedShipping, items };
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(new URL(req.url, PUBLIC_BASE_URL).pathname);
  if (reqPath === "/") reqPath = "/index.html";
  const relativePath = path.normalize(reqPath).replace(/^([/\\])+/, "");
  let filePath = path.resolve(distDir, relativePath);

  if (filePath !== distDir && !filePath.startsWith(`${distDir}${path.sep}`)) {
    res.writeHead(403, withSecurityHeaders());
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, "index.html");
  }

  const ext = path.extname(filePath);
  const contentType = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  }[ext] || "application/octet-stream";

  const cacheControl = filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable";
  res.writeHead(200, withSecurityHeaders({ "Content-Type": contentType, "Cache-Control": cacheControl }));
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(filePath).pipe(res);
}

function handleCatalogScript(req, res) {
  const modifiedAt = fs.existsSync(catalogPath) ? fs.statSync(catalogPath).mtimeMs : 0;
  if (!catalogScriptCache || catalogScriptCache.modifiedAt !== modifiedAt) {
    const plain = Buffer.from(`window.__LUXE_CATALOG__=${escapeScriptJson(loadCatalog())};`);
    catalogScriptCache = { modifiedAt, plain, gzip: zlib.gzipSync(plain, { level: 6 }) };
  }
  const useGzip = /\bgzip\b/.test(String(req.headers["accept-encoding"] || ""));
  const body = useGzip ? catalogScriptCache.gzip : catalogScriptCache.plain;
  res.writeHead(200, withSecurityHeaders({
    "Content-Type": "text/javascript; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Accept-Encoding",
    ...(useGzip ? { "Content-Encoding": "gzip" } : {}),
    "Content-Length": Buffer.byteLength(body),
  }));
  res.end(body);
}

function handleAdminCatalog(req, res) {
  if (!requireAdmin(req, res)) return;
  return json(res, 200, { ok: true, catalog: loadCatalog() });
}

function handleAdminExport(req, res) {
  if (!requireAdmin(req, res)) return;
  const body = JSON.stringify(loadCatalog(), null, 2);
  res.writeHead(200, withSecurityHeaders({
    "Content-Type": "application/json; charset=utf-8",
    "Content-Disposition": "attachment; filename=luxe-catalog-export.json",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  }));
  res.end(body);
}

async function handleAdminProduct(req, res, id) {
  if (!requireAdmin(req, res)) return;
  const catalog = loadCatalog();
  if (req.method === "DELETE") {
    catalog.products = catalog.products.filter((p) => p.id !== id);
    return json(res, 200, { ok: true, catalog: saveCatalog(catalog) });
  }
  if (req.method === "PUT") {
    const body = JSON.parse(await readBody(req));
    const product = { ...body, id: body.id || id };
    const index = catalog.products.findIndex((p) => p.id === id || p.id === product.id);
    if (index >= 0) catalog.products[index] = product;
    else catalog.products.unshift(product);
    return json(res, 200, { ok: true, catalog: saveCatalog(catalog) });
  }
  return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
}

async function handleAdminCategory(req, res, id) {
  if (!requireAdmin(req, res)) return;
  const catalog = loadCatalog();
  if (req.method === "DELETE") {
    catalog.categories = catalog.categories.filter((c) => c.id !== id);
    return json(res, 200, { ok: true, catalog: saveCatalog(catalog) });
  }
  if (req.method === "PUT") {
    const body = JSON.parse(await readBody(req));
    const category = { ...body, id: body.id || id };
    const index = catalog.categories.findIndex((c) => c.id === id || c.id === category.id);
    if (index >= 0) catalog.categories[index] = category;
    else catalog.categories.unshift(category);
    return json(res, 200, { ok: true, catalog: saveCatalog(catalog) });
  }
  return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
}

async function handleCreatePayment(req, res) {
  if (!XPAY_ALIAS || !XPAY_SECRET_KEY) {
    return json(res, 503, {
      ok: false,
      error: "XPAY_NOT_CONFIGURED",
      message: "Configura XPAY_ALIAS e XPAY_SECRET_KEY sul server prima di accettare pagamenti reali.",
    });
  }

  const bodyText = await readBody(req);
  const body = bodyText ? JSON.parse(bodyText) : {};
  const { amountCents, customer, shipping, items } = buildTrustedOrder(body);

  const codTrans = `LX-${Date.now()}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
  const divisa = XPAY_CURRENCY;
  const mac = signStartPayment({ codTrans, amountCents, divisa });

  const order = {
    codTrans,
    amountCents,
    divisa,
    customer,
    shipping,
    items,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  pendingOrders.set(codTrans, order);
  persistOrder(order);

  const params = new URLSearchParams({
    alias: XPAY_ALIAS,
    importo: String(amountCents),
    divisa,
    codTrans,
    url: `${PUBLIC_BASE_URL}/xpay/esito`,
    url_back: `${PUBLIC_BASE_URL}/checkout?payment=cancelled&order=${encodeURIComponent(codTrans)}`,
    mail: String(customer.email),
    languageId: XPAY_LANGUAGE,
    descrizione: `Ordine LUXE ${codTrans}`,
    mac,
  });

  return json(res, 200, {
    ok: true,
    provider: "nexi-xpay",
    environment: XPAY_ENV,
    codTrans,
    amountCents,
    paymentUrl: `${xpayEndpoint}?${params.toString()}`,
  });
}

function handleXpayOutcome(req, res) {
  const url = new URL(req.url, PUBLIC_BASE_URL);
  const params = Object.fromEntries(url.searchParams.entries());
  const order = getOrder(params.codTrans);
  const expectedMac = signResponse(params);
  const macOk = safeEqual(String(params.mac || "").toLowerCase(), expectedMac.toLowerCase());
  const orderMatches = !!order && String(order.amountCents) === String(params.importo || "") && order.divisa === params.divisa;
  const transitionAccepted = order?.status === "pending" && macOk && orderMatches;
  const paid = transitionAccepted && String(params.esito).toUpperCase() === "OK";

  if (transitionAccepted) {
    order.status = paid ? "paid" : "failed";
    order.xpay = { ...params, mac: params.mac ? "[REDACTED]" : undefined, macOk };
    order.updatedAt = new Date().toISOString();
    persistOrder(order);
  }

  const redirectUrl = paid
    ? `/ordine-confermato?provider=xpay&order=${encodeURIComponent(params.codTrans || "")}`
    : `/checkout?payment=failed&order=${encodeURIComponent(params.codTrans || "")}`;

  res.writeHead(302, withSecurityHeaders({ Location: redirectUrl, "Cache-Control": "no-store" }));
  res.end();
}

function handlePaymentStatus(req, res) {
  const url = new URL(req.url, PUBLIC_BASE_URL);
  const orderId = url.searchParams.get("order") || "";
  const order = getOrder(orderId);
  if (!order) return json(res, 404, { ok: false, error: "ORDER_NOT_FOUND" });
  return json(res, 200, {
    ok: true,
    order: {
      codTrans: order.codTrans,
      amountCents: order.amountCents,
      divisa: order.divisa,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", PUBLIC_BASE_URL);
    if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { ok: true, service: "luxe-storefront" });
    if (req.method === "GET" && url.pathname === "/api/catalog-script") return handleCatalogScript(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/catalog") return handleAdminCatalog(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/export") return handleAdminExport(req, res);
    if (url.pathname.startsWith("/api/admin/products/")) return await handleAdminProduct(req, res, decodeURIComponent(url.pathname.replace("/api/admin/products/", "")));
    if (url.pathname.startsWith("/api/admin/categories/")) return await handleAdminCategory(req, res, decodeURIComponent(url.pathname.replace("/api/admin/categories/", "")));
    if (req.method === "POST" && url.pathname === "/api/xpay/create-payment") {
      if (!allowRequest(req, "payment", paymentRateLimit)) {
        res.setHeader("Retry-After", "600");
        return json(res, 429, { ok: false, error: "RATE_LIMITED", message: "Troppi tentativi. Riprova tra alcuni minuti." });
      }
      return await handleCreatePayment(req, res);
    }
    if (req.method === "GET" && url.pathname === "/api/xpay/status") return handlePaymentStatus(req, res);
    if (req.method === "GET" && url.pathname === "/xpay/esito") return handleXpayOutcome(req, res);
    if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
    return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return json(res, error.statusCode, { ok: false, error: error.code, message: error.message });
    }
    if (error instanceof URIError || error instanceof SyntaxError) {
      return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "Richiesta non valida." });
    }
    return json(res, 500, { ok: false, error: "SERVER_ERROR", message: "Errore interno del server." });
  }
});

server.listen(PORT, () => {
  console.log(`LUXE storefront + Nexi XPay server running on ${PUBLIC_BASE_URL}`);
  console.log(`XPay mode: ${XPAY_ENV}${XPAY_ALIAS ? "" : " (not configured)"}`);
});
