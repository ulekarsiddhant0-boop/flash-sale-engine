const express = require("express");
const requireAdminToken = require("../middleware/adminAuth");

function createAdminRouter({ Product, Order, redis } = {}) {
  const adminRouter = express.Router();

  // Apply authentication before every current and future admin route.
  adminRouter.use(requireAdminToken);

  adminRouter.get("/stats", async (req, res) => {
    try {
      const products = Product || require("../models/Product");
      const orders = Order || require("../models/Order");
      const cache = redis || require("../config/redis");
      const productId = "6a2eb84e12a1d5c7154396ac";

      const product = await products.findById(productId);
      const totalOrders = await orders.countDocuments();

      const redisStock = await cache.get(`product:${productId}:stock`);
      const successfulOrders =
        Number(await cache.get("stats:successful_orders")) || 0;

      const rateLimitedRequests =
        Number(await cache.get("stats:rate_limited_requests")) || 0;
      res.json({
        success: true,
        data: {
          mongoStock: product.stock,
          redisStock: Number(redisStock),
          totalOrders,
          successfulOrders,
          rateLimitedRequests,
        },
      });
    } catch (error) {
      console.error("Admin stats request failed:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to fetch stats",
      });
    }
  });
  adminRouter.post("/reset-stock", async (req, res) => {
    try {
      const products = Product || require("../models/Product");
      const cache = redis || require("../config/redis");
      const productId = "6a2eb84e12a1d5c7154396ac";
      const stock = 100;

      await products.findByIdAndUpdate(productId, { stock });
      await cache.set(`product:${productId}:stock`, stock);
      await cache.del(`product:${productId}:sold_out`);
      await cache.del(`product:${productId}:details`);

      res.json({
        success: true,
        message: `Stock successfully reset to ${stock}.`,
      });
    } catch (error) {
      console.error("Admin stock reset failed:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to reset stock.",
      });
    }
  });

  return adminRouter;
}

module.exports = createAdminRouter();
module.exports.createAdminRouter = createAdminRouter;
