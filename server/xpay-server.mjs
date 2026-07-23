import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const xpayEndpoint = XPAY_ENV === "production"
  ? "https://ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet"
  : "https://int-ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet";

const pendingOrders = new Map();

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
  const url = new URL(req.url || "/", PUBLIC_BASE_URL);
  if (req.headers["x-admin-token"] === ADMIN_TOKEN || url.searchParams.get("token") === ADMIN_TOKEN) return true;
  json(res, 401, { ok: false, error: "ADMIN_TOKEN_REQUIRED", message: "Inserisci il token admin." });
  return false;
}

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Request body too large"));
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

function safeOrderLines(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 100).map((item) => ({
    productId: String(item.productId || ""),
    variantId: item.variantId ? String(item.variantId) : undefined,
    title: String(item.title || ""),
    brand: String(item.brand || ""),
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    selectedSize: item.selectedSize ? String(item.selectedSize) : undefined,
    selectedColor: item.selectedColor ? String(item.selectedColor) : undefined,
  }));
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(new URL(req.url, PUBLIC_BASE_URL).pathname);
  if (reqPath === "/") reqPath = "/index.html";
  let filePath = path.join(distDir, reqPath);

  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
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

  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

function handleCatalogScript(_req, res) {
  const catalog = loadCatalog();
  const body = `window.__LUXE_CATALOG__=${JSON.stringify(catalog)};`;
  res.writeHead(200, {
    "Content-Type": "text/javascript; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function handleAdminCatalog(req, res) {
  if (!requireAdmin(req, res)) return;
  return json(res, 200, { ok: true, catalog: loadCatalog() });
}

function handleAdminExport(req, res) {
  if (!requireAdmin(req, res)) return;
  const body = JSON.stringify(loadCatalog(), null, 2);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Disposition": "attachment; filename=luxe-catalog-export.json",
    "Content-Length": Buffer.byteLength(body),
  });
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
  const amountCents = Math.round(Number(body.amountCents || 0));
  const customer = body.customer || {};
  const shipping = body.shipping || {};

  if (!Number.isFinite(amountCents) || amountCents < 100) {
    return json(res, 400, { ok: false, error: "INVALID_AMOUNT" });
  }
  if (!customer.email || !customer.firstName || !customer.lastName) {
    return json(res, 400, { ok: false, error: "MISSING_CUSTOMER" });
  }

  const codTrans = `LX-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const divisa = XPAY_CURRENCY;
  const mac = signStartPayment({ codTrans, amountCents, divisa });

  pendingOrders.set(codTrans, {
    codTrans,
    amountCents,
    divisa,
    customer,
    shipping,
    items: safeOrderLines(body.items),
    createdAt: new Date().toISOString(),
    status: "pending",
  });

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
  const order = pendingOrders.get(params.codTrans);
  const expectedMac = signResponse(params);
  const macOk = !!params.mac && params.mac.toLowerCase() === expectedMac.toLowerCase();
  const paid = macOk && String(params.esito).toUpperCase() === "OK";

  if (order) {
    order.status = paid ? "paid" : "failed";
    order.xpay = { ...params, mac: params.mac ? "[REDACTED]" : undefined, macOk };
    order.updatedAt = new Date().toISOString();
  }

  const redirectUrl = paid
    ? `/ordine-confermato?provider=xpay&order=${encodeURIComponent(params.codTrans || "")}`
    : `/checkout?payment=failed&order=${encodeURIComponent(params.codTrans || "")}`;

  res.writeHead(302, { Location: redirectUrl, "Cache-Control": "no-store" });
  res.end();
}

function handlePaymentStatus(req, res) {
  const url = new URL(req.url, PUBLIC_BASE_URL);
  const orderId = url.searchParams.get("order") || "";
  const order = pendingOrders.get(orderId);
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
    if (req.method === "GET" && url.pathname === "/api/catalog-script") return handleCatalogScript(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/catalog") return handleAdminCatalog(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/export") return handleAdminExport(req, res);
    if (url.pathname.startsWith("/api/admin/products/")) return await handleAdminProduct(req, res, decodeURIComponent(url.pathname.replace("/api/admin/products/", "")));
    if (url.pathname.startsWith("/api/admin/categories/")) return await handleAdminCategory(req, res, decodeURIComponent(url.pathname.replace("/api/admin/categories/", "")));
    if (req.method === "POST" && url.pathname === "/api/xpay/create-payment") return await handleCreatePayment(req, res);
    if (req.method === "GET" && url.pathname === "/api/xpay/status") return handlePaymentStatus(req, res);
    if (req.method === "GET" && url.pathname === "/xpay/esito") return handleXpayOutcome(req, res);
    if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
    return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, error: "SERVER_ERROR", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

server.listen(PORT, () => {
  console.log(`LUXE storefront + Nexi XPay server running on ${PUBLIC_BASE_URL}`);
  console.log(`XPay mode: ${XPAY_ENV}${XPAY_ALIAS ? "" : " (not configured)"}`);
});
