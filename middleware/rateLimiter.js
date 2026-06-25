const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const CHECKOUT_LIMIT = 3; // Maximum requests allowed
const WINDOW_SIZE_IN_SECONDS = 10; // Time window tracking

exports.checkoutRateLimiter = async (req, res, next) => {
  // Get the user's IP address
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const redisKey = `rate_limit:checkout:${ip}`;

  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const windowStart = currentTime - WINDOW_SIZE_IN_SECONDS;

    // 1. Multi/Exec pipeline to ensure atomic execution
    const pipeline = redis.pipeline();

    // Remove old requests outside our 10-second window
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    // Get total remaining requests made by this IP in the current window
    pipeline.zcard(redisKey);
    // Add the current request timestamp to the sorted set
    pipeline.zadd(redisKey, currentTime, `${currentTime}-${Math.random()}`);
    // Set an expiry timer so empty keys automatically clean themselves out of Redis memory
    pipeline.expire(redisKey, WINDOW_SIZE_IN_SECONDS + 2);

    const results = await pipeline.exec();
    const requestCount = results[1][1]; // Extract the result of zcard

    // 2. Throttling Check
    if (requestCount >= CHECKOUT_LIMIT) {
      await redis.incr("stats:rate_limited_requests");
      return res.status(429).json({
        success: false,
        message: `❌ Too many attempts! You are clicking too fast. Please wait ${WINDOW_SIZE_IN_SECONDS} seconds.`,
      });
    }

    // Everything looks safe, proceed to the checkout controller!
    next();
  } catch (error) {
    console.error("Rate limiting middleware error:", error);
    // If Redis has an internal hitch, fail-safe and let the request proceed to avoid blocking users
    next();
  }
};
