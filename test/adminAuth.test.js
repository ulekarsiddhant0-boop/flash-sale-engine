const assert = require("node:assert/strict");
const { after, afterEach, beforeEach, test } = require("node:test");
const express = require("express");
const createAdminRouter = require("../routes/adminRoutes").createAdminRouter;

const previousAdminToken = process.env.ADMIN_TOKEN;
let server;
let baseUrl;
let productLookups;
let orderCounts;
let redisCalls;

beforeEach(async () => {
  process.env.ADMIN_TOKEN = "test-admin-token-123456";
  productLookups = 0;
  orderCounts = 0;
  redisCalls = [];

  const app = express();
  app.use("/api/admin", createAdminRouter({
    Product: {
      findById: async () => {
        productLookups += 1;
        return { stock: 7 };
      },
      findByIdAndUpdate: async () => ({ acknowledged: true }),
    },
    Order: {
      countDocuments: async () => {
        orderCounts += 1;
        return 4;
      },
    },
    redis: {
      get: async (key) => key.endsWith(":stock") ? "7" : "0",
      set: async (...args) => redisCalls.push(["set", ...args]),
      del: async (...args) => redisCalls.push(["del", ...args]),
    },
  }));
  // These represent the existing public customer route mounts in server.js.
  app.get("/api/products/:id", (req, res) => res.json({ success: true }));
  app.post("/api/orders/checkout", (req, res) => res.status(201).json({ success: true }));

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    server = undefined;
  }
});

after(() => {
  if (previousAdminToken === undefined) delete process.env.ADMIN_TOKEN;
  else process.env.ADMIN_TOKEN = previousAdminToken;
});

test("admin endpoints reject missing, malformed, and incorrect credentials", async () => {
  const requests = [
    ["GET", "/api/admin/stats", undefined],
    ["POST", "/api/admin/reset-stock", undefined],
    ["GET", "/api/admin/stats", "Basic test-admin-token-123456"],
    ["GET", "/api/admin/stats", "Bearer"],
    ["GET", "/api/admin/stats", "Bearer token with-spaces"],
    ["POST", "/api/admin/reset-stock", "Bearer wrong-token"],
  ];

  for (const [method, path, authorization] of requests) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: authorization ? { Authorization: authorization } : {},
    });
    assert.equal(response.status, 401, `${method} ${path} should reject ${authorization || "missing auth"}`);
  }

  assert.equal(productLookups, 0);
  assert.equal(orderCounts, 0);
  assert.deepEqual(redisCalls, []);
});

test("an unset or empty ADMIN_TOKEN fails closed", async () => {
  for (const configuredToken of [undefined, ""]) {
    if (configuredToken === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = configuredToken;

    const response = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: "Bearer test-admin-token-123456" },
    });
    assert.equal(response.status, 401);
  }
});

test("valid bearer token can access stats and reset stock", async () => {
  const headers = { Authorization: "Bearer test-admin-token-123456" };
  const stats = await fetch(`${baseUrl}/api/admin/stats`, { headers });
  assert.equal(stats.status, 200);
  assert.deepEqual((await stats.json()).data, {
    mongoStock: 7,
    redisStock: 7,
    totalOrders: 4,
    successfulOrders: 0,
    rateLimitedRequests: 0,
  });

  const reset = await fetch(`${baseUrl}/api/admin/reset-stock`, { method: "POST", headers });
  assert.equal(reset.status, 200);
  assert.equal(productLookups, 1);
  assert.equal(orderCounts, 1);
  assert.equal(redisCalls.length, 3);
});

test("customer product and checkout routes remain public", async () => {
  const product = await fetch(`${baseUrl}/api/products/example`);
  const checkout = await fetch(`${baseUrl}/api/orders/checkout`, { method: "POST" });
  assert.equal(product.status, 200);
  assert.equal(checkout.status, 201);
});
