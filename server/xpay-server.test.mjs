import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import { after, before, test } from "node:test";
import { spawn } from "node:child_process";

const port = 4192;
const baseUrl = `http://127.0.0.1:${port}`;
const adminToken = "test-admin-token-with-sufficient-length";
const xpaySecret = "test-xpay-secret";
const ordersDir = `/tmp/luxe-orders-test-${process.pid}`;
let child;

function rawRequest(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port, path: pathname, ...options }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Test server did not start");
}

async function startServer() {
  child = spawn(process.execPath, ["server/xpay-server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      PUBLIC_BASE_URL: baseUrl,
      ADMIN_TOKEN: adminToken,
      XPAY_ENV: "test",
      XPAY_ALIAS: "test-alias",
      XPAY_SECRET_KEY: xpaySecret,
      ORDERS_DIR: ordersDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForServer();
}

before(async () => {
  fs.rmSync(ordersDir, { recursive: true, force: true });
  await startServer();
});

after(() => {
  child?.kill("SIGTERM");
  fs.rmSync(ordersDir, { recursive: true, force: true });
});

test("static responses include baseline security headers", async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
});

test("health endpoint reports readiness", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(payload, { ok: true, service: "luxe-storefront" });
});

test("large catalog responses support gzip compression", async () => {
  const response = await rawRequest("/api/catalog-script", { headers: { "accept-encoding": "gzip" } });
  assert.equal(response.status, 200);
  assert.equal(response.headers["content-encoding"], "gzip");
  assert.match(response.headers.vary ?? "", /accept-encoding/i);
});

test("malformed URL encoding returns a safe 400 response", async () => {
  const response = await rawRequest("/%E0%A4%A");
  assert.equal(response.status, 400);
  assert.doesNotMatch(response.body, /URI malformed/i);
});

test("admin token is never accepted in the query string", async () => {
  const response = await fetch(`${baseUrl}/api/admin/catalog?token=${encodeURIComponent(adminToken)}`);
  assert.equal(response.status, 401);
});

test("payment total is derived from the server catalog", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.find((candidate) => candidate.stockStatus !== "out_of_stock");
  const variant = product.variants.find((candidate) => candidate.available) ?? product.variants[0];
  const unitPrice = variant?.price ?? product.salePrice ?? product.price;
  const expectedAmount = Math.round(unitPrice * 100);

  const response = await fetch(`${baseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      amountCents: 100,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [{ productId: product.id, variantId: variant?.id, quantity: 1, unitPrice: 0 }],
    }),
  });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.amountCents, expectedAmount);
});

test("payment rejects products absent from the server catalog", async () => {
  const response = await fetch(`${baseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      amountCents: 100,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [{ productId: "does-not-exist", quantity: 1, unitPrice: 1 }],
    }),
  });
  assert.equal(response.status, 400);
});

test("XPay callback cannot confirm a different amount", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.find((candidate) => candidate.stockStatus !== "out_of_stock");
  const variant = product.variants.find((candidate) => candidate.available) ?? product.variants[0];
  const createResponse = await fetch(`${baseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [{ productId: product.id, variantId: variant?.id, quantity: 1 }],
    }),
  });
  const order = await createResponse.json();
  const wrongAmount = String(order.amountCents + 1);
  const params = {
    codTrans: order.codTrans,
    esito: "OK",
    importo: wrongAmount,
    divisa: "EUR",
    data: "20260723",
    orario: "130000",
    codAut: "ABC123",
  };
  const raw = `codTrans=${params.codTrans}esito=${params.esito}importo=${params.importo}divisa=${params.divisa}data=${params.data}orario=${params.orario}codAut=${params.codAut}${xpaySecret}`;
  const mac = crypto.createHash("sha1").update(raw).digest("hex");
  const callback = await fetch(`${baseUrl}/xpay/esito?${new URLSearchParams({ ...params, mac })}`, { redirect: "manual" });
  assert.equal(callback.status, 302);
  assert.match(callback.headers.get("location") ?? "", /payment=failed/);

  const status = await fetch(`${baseUrl}/api/xpay/status?order=${encodeURIComponent(order.codTrans)}`);
  const statusPayload = await status.json();
  assert.equal(statusPayload.order.status, "pending");
});

test("invalid XPay MAC does not mutate a pending order", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.find((candidate) => candidate.stockStatus !== "out_of_stock");
  const variant = product.variants.find((candidate) => candidate.available) ?? product.variants[0];
  const createResponse = await fetch(`${baseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [{ productId: product.id, variantId: variant?.id, quantity: 1 }],
    }),
  });
  const order = await createResponse.json();
  await fetch(`${baseUrl}/xpay/esito?${new URLSearchParams({ codTrans: order.codTrans, esito: "OK", importo: String(order.amountCents), divisa: "EUR", mac: "invalid" })}`, { redirect: "manual" });
  const status = await fetch(`${baseUrl}/api/xpay/status?order=${encodeURIComponent(order.codTrans)}`).then((response) => response.json());
  assert.equal(status.order.status, "pending");
});

test("a paid order cannot be downgraded by callback replay", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.find((candidate) => candidate.stockStatus !== "out_of_stock");
  const variant = product.variants.find((candidate) => candidate.available) ?? product.variants[0];
  const createResponse = await fetch(`${baseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [{ productId: product.id, variantId: variant?.id, quantity: 1 }],
    }),
  });
  const order = await createResponse.json();
  const params = { codTrans: order.codTrans, esito: "OK", importo: String(order.amountCents), divisa: "EUR", data: "20260723", orario: "130000", codAut: "ABC123" };
  const raw = `codTrans=${params.codTrans}esito=${params.esito}importo=${params.importo}divisa=${params.divisa}data=${params.data}orario=${params.orario}codAut=${params.codAut}${xpaySecret}`;
  const mac = crypto.createHash("sha1").update(raw).digest("hex");
  await fetch(`${baseUrl}/xpay/esito?${new URLSearchParams({ ...params, mac })}`, { redirect: "manual" });
  await fetch(`${baseUrl}/xpay/esito?${new URLSearchParams({ ...params, mac: "invalid" })}`, { redirect: "manual" });
  const status = await fetch(`${baseUrl}/api/xpay/status?order=${encodeURIComponent(order.codTrans)}`).then((response) => response.json());
  assert.equal(status.order.status, "paid");
});

test("duplicate cart lines cannot exceed aggregate variant stock", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.find((candidate) => candidate.stockStatus !== "out_of_stock" && candidate.variants.some((variant) => variant.available && variant.stock > 0 && variant.stock <= 10));
  const variant = product.variants.find((candidate) => candidate.available && candidate.stock > 0 && candidate.stock <= 10);
  const response = await fetch(`${baseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [
        { productId: product.id, variantId: variant.id, quantity: variant.stock },
        { productId: product.id, variantId: variant.id, quantity: variant.stock },
      ],
    }),
  });
  assert.equal(response.status, 409);
});

test("pending orders reserve variant stock", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.findLast((candidate) => candidate.stockStatus !== "out_of_stock" && candidate.variants.some((variant) => variant.available && variant.stock > 0 && variant.stock <= 10));
  const variant = product.variants.find((candidate) => candidate.available && candidate.stock > 0 && candidate.stock <= 10);
  const orderBody = (quantity) => JSON.stringify({
    customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
    shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
    items: [{ productId: product.id, variantId: variant.id, quantity }],
  });
  const first = await fetch(`${baseUrl}/api/xpay/create-payment`, { method: "POST", headers: { "content-type": "application/json" }, body: orderBody(variant.stock) });
  const second = await fetch(`${baseUrl}/api/xpay/create-payment`, { method: "POST", headers: { "content-type": "application/json" }, body: orderBody(1) });
  assert.equal(first.status, 200);
  assert.equal(second.status, 409);
});

test("pending orders survive a server restart", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.slice(1000).find((candidate) => candidate.stockStatus !== "out_of_stock");
  const variant = product.variants.find((candidate) => candidate.available) ?? product.variants[0];
  const createResponse = await fetch(`${baseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [{ productId: product.id, variantId: variant?.id, quantity: 1 }],
    }),
  });
  const order = await createResponse.json();
  assert.equal(createResponse.status, 200);

  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
  await startServer();

  const statusResponse = await fetch(`${baseUrl}/api/xpay/status?order=${encodeURIComponent(order.codTrans)}`);
  const statusPayload = await statusResponse.json();
  assert.equal(statusResponse.status, 200);
  assert.equal(statusPayload.order.status, "pending");
});

test("aged orders expire before direct late callbacks and never redirect to success", async () => {
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const firstProduct = catalog.products.slice(1500).find((candidate) => candidate.stockStatus !== "out_of_stock");
  const firstVariant = firstProduct.variants.find((candidate) => candidate.available) ?? firstProduct.variants[0];
  const bodyFor = (product, variant) => JSON.stringify({
    customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
    shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
    items: [{ productId: product.id, variantId: variant?.id, quantity: 1 }],
  });
  const created = await fetch(`${baseUrl}/api/xpay/create-payment`, { method: "POST", headers: { "content-type": "application/json" }, body: bodyFor(firstProduct, firstVariant) }).then((response) => response.json());
  const orderPath = `${ordersDir}/${created.codTrans}.json`;
  const stored = JSON.parse(fs.readFileSync(orderPath, "utf8"));
  stored.createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  fs.writeFileSync(orderPath, JSON.stringify(stored));
  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
  await startServer();

  const params = { codTrans: created.codTrans, esito: "OK", importo: String(created.amountCents), divisa: "EUR", data: "20260723", orario: "130000", codAut: "ABC123" };
  const raw = `codTrans=${params.codTrans}esito=${params.esito}importo=${params.importo}divisa=${params.divisa}data=${params.data}orario=${params.orario}codAut=${params.codAut}${xpaySecret}`;
  const mac = crypto.createHash("sha1").update(raw).digest("hex");
  const callback = await fetch(`${baseUrl}/xpay/esito?${new URLSearchParams({ ...params, mac })}`, { redirect: "manual" });

  const status = await fetch(`${baseUrl}/api/xpay/status?order=${encodeURIComponent(created.codTrans)}`).then((response) => response.json());
  assert.equal(status.order.status, "expired");
  assert.match(callback.headers.get("location") ?? "", /payment=failed/);
});

test("production refuses placeholder credentials", async () => {
  const productionChild = spawn(process.execPath, ["server/xpay-server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "4193",
      PUBLIC_BASE_URL: "https://shop.example.com",
      ADMIN_TOKEN: "change_me_long_random_admin_token",
      XPAY_ENV: "production",
      XPAY_ALIAS: "production-alias",
      XPAY_SECRET_KEY: "production-secret",
      ORDERS_DIR: `${ordersDir}-production`,
    },
    stdio: "ignore",
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const exitCode = productionChild.exitCode;
  if (exitCode === null) productionChild.kill("SIGTERM");
  assert.notEqual(exitCode, null);
  assert.notEqual(exitCode, 0);
});

test("payment creation is rate limited per client", async () => {
  const ratePort = 4194;
  const rateBaseUrl = `http://127.0.0.1:${ratePort}`;
  const rateChild = spawn(process.execPath, ["server/xpay-server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(ratePort),
      PUBLIC_BASE_URL: rateBaseUrl,
      ADMIN_TOKEN: adminToken,
      XPAY_ENV: "test",
      XPAY_ALIAS: "test-alias",
      XPAY_SECRET_KEY: xpaySecret,
      PAYMENT_RATE_LIMIT: "2",
      ORDERS_DIR: `${ordersDir}-rate`,
    },
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { if ((await fetch(`${rateBaseUrl}/`)).ok) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));
  const product = catalog.products.find((candidate) => candidate.stockStatus !== "out_of_stock");
  const variant = product.variants.find((candidate) => candidate.available) ?? product.variants[0];
  const request = () => fetch(`${rateBaseUrl}/api/xpay/create-payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+393401234567" },
      shipping: { address: "Via Roma 1", city: "Milano", zip: "20100", country: "Italia", method: "standard" },
      items: [{ productId: product.id, variantId: variant?.id, quantity: 1 }],
    }),
  });
  const statuses = [(await request()).status, (await request()).status, (await request()).status];
  rateChild.kill("SIGTERM");
  assert.deepEqual(statuses, [200, 200, 429]);
});
