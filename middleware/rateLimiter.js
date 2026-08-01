const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const CHECKOUT_LIMIT = 3; 
const WINDOW_SIZE_IN_SECONDS = 10; 

exports.checkoutRateLimiter = async (req, res, next) => {

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const redisKey = `rate_limit:checkout:${ip}`;

  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const windowStart = currentTime - WINDOW_SIZE_IN_SECONDS;

    const pipeline = redis.pipeline();

    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    pipeline.zcard(redisKey);
    pipeline.zadd(redisKey, currentTime, `${currentTime}-${Math.random()}`);
    pipeline.expire(redisKey, WINDOW_SIZE_IN_SECONDS + 2);

    const results = await pipeline.exec();
    const requestCount = results[1][1]; 

    if (requestCount >= CHECKOUT_LIMIT) {
      await redis.incr("stats:rate_limited_requests");
      return res.status(429).json({
        success: false,
        message: `❌ Too many attempts! You are clicking too fast. Please wait ${WINDOW_SIZE_IN_SECONDS} seconds.`,
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiting middleware error:", error);
    next();
  }
};
