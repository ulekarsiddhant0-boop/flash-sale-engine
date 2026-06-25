const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const redis = require("../config/redis");

router.get("/stats", async (req, res) => {
  try {
    const productId = "6a2eb84e12a1d5c7154396ac";

    const product = await Product.findById(productId);
    const totalOrders = await Order.countDocuments();

    const redisStock = await redis.get(`product:${productId}:stock`);
    const successfulOrders =
      Number(await redis.get("stats:successful_orders")) || 0;

    const rateLimitedRequests =
      Number(await redis.get("stats:rate_limited_requests")) || 0;
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
});
router.post("/reset-stock", async (req, res) => {
  try {
    const productId = "6a2eb84e12a1d5c7154396ac";
    const stock = 100;

    // Update MongoDB
    await Product.findByIdAndUpdate(productId, {
      stock,
    });

    // Update Redis inventory
    await redis.set(`product:${productId}:stock`, stock);

    // Remove sold-out flag if it exists
    await redis.del(`product:${productId}:sold_out`);

    // Remove cached product details
    await redis.del(`product:${productId}:details`);

    res.json({
      success: true,
      message: `Stock successfully reset to ${stock}.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to reset stock.",
    });
  }
});
module.exports = router;
