const Redis = require("ioredis");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Initialize Redis client using our cloud URL
const redis = new Redis(process.env.REDIS_URL);

exports.placeOrder = async (req, res) => {
  const { productId } = req.body;

  try {
    const redisStockKey = `product:${productId}:stock`;
    const redisLockoutKey = `product:${productId}:sold_out`;

    // 1. FAST LOCKOUT CHECK: If the sold-out flag exists, freeze the request instantly
    const isSoldOut = await redis.get(redisLockoutKey);
    if (isSoldOut === "true") {
      return res.status(400).json({
        success: false,
        message: "🔒 SALE CLOSED: This item is completely sold out!",
      });
    }

    // 2. Atomic Decrement inside Redis Cloud
    const currentStock = await redis.decr(redisStockKey);

    // 3. Out of Stock Safeguard & Lockout Trigger
    if (currentStock < 0) {
      await redis.incr(redisStockKey);

      // Set the global lockout flag in Redis so future requests get stopped at Step 1
      await redis.set(redisLockoutKey, "true");

      return res.status(400).json({
        success: false,
        message: "❌ Out of stock! Better luck next time.",
      });
    }

    // 4. Stock was available! Create the order asynchronously in MongoDB
    const newOrder = await Order.create({
      productId,
      quantity: 1,
      status: "Completed",
    });

    // Update MongoDB stock asynchronously in the background
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -1 } });

    return res.status(201).json({
      success: true,
      message: "🎉 Order placed successfully! Item secured.",
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
// Keep all your existing placeOrder code at the top...

// Add this brand new function at the bottom:
exports.getProductDetails = async (req, res) => {
    const { id } = req.params;
    const cacheKey = `product:${id}:details`;

    try {
        // 1. Try to fetch details from Redis Cache
        const cachedProduct = await redis.get(cacheKey);
        
        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                source: '⚡ Redis Cache (Cache Hit!)',
                data: JSON.parse(cachedProduct)
            });
        }

        // 2. Cache Miss - Fetch from MongoDB permanent storage
        console.log('🔍 Cache Miss! Fetching from MongoDB...');
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // 3. Store the retrieved product inside Redis cache for 5 minutes
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