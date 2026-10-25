const Redis = require("ioredis");
const Order = require("../models/Order");
const Product = require("../models/Product");


const redis = new Redis(process.env.REDIS_URL);

exports.placeOrder = async (req, res) => {
  const { productId } = req.body;

  try {
    const redisStockKey = `product:${productId}:stock`;
    const redisLockoutKey = `product:${productId}:sold_out`;

    const isSoldOut = await redis.get(redisLockoutKey);
    if (isSoldOut === "true") {
      return res.status(400).json({
        success: false,
        message: "🔒 SALE CLOSED: This item is completely sold out!",
      });
    }

    const currentStock = await redis.decr(redisStockKey);

    if (currentStock < 0) {
      await redis.incr(redisStockKey);

      await redis.set(redisLockoutKey, "true");

      return res.status(400).json({
        success: false,
        message: "❌ Out of stock! Better luck next time.",
      });
    }

    const newOrder = await Order.create({
      productId,
      quantity: 1,
      status: "Completed",
    });

    await Product.findByIdAndUpdate(productId, { $inc: { stock: -1 } });
    await redis.del(`product:${productId}:details`);
    await redis.incr("stats:successful_orders");
    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Item secured.",
      orderId: newOrder._id,
      remainingStockInRedis: currentStock,
    });
  } catch (error) {
    console.error("Checkout routing error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.getProductDetails = async (req, res) => {
    const { id } = req.params;
    const cacheKey = `product:${id}:details`;

    try {
        const cachedProduct = await redis.get(cacheKey);
        
        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                source: '⚡ Redis Cache (Cache Hit!)',
                data: JSON.parse(cachedProduct)
            });
        }

        console.log('🔍 Cache Miss! Fetching from MongoDB...');
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await redis.setex(cacheKey, 300, JSON.stringify(product));

        return res.status(200).json({
            success: true,
            source: '💾 MongoDB Database (Cache Miss - Synced to Redis)',
            data: product
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
