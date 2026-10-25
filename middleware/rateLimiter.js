
const CHECKOUT_LIMIT = 3;
const WINDOW_SIZE_IN_SECONDS = 10;

let defaultRedisClient;

function getRedisClient() {
  if (!defaultRedisClient) {
    defaultRedisClient = require("../config/redis");
  }

  return defaultRedisClient;
}

function createCheckoutRateLimiter({
  redisClient,
  limit = CHECKOUT_LIMIT,
  windowSeconds = WINDOW_SIZE_IN_SECONDS,
  keyPrefix = "rate_limit:checkout",
  statsKey = "stats:rate_limited_requests",
} = {}) {
  return async (req, res, next) => {

    const ip = req.socket.remoteAddress || "unknown";
    const redisKey = `${keyPrefix}:${ip}`;

    try {
      const client = redisClient || getRedisClient();
      const currentTime = Date.now();
      const windowStart = currentTime - windowSeconds * 1000;
      const requestId = `${currentTime}-${Math.random()}`;

      const results = await client
        .multi()
        .zremrangebyscore(redisKey, 0, windowStart)
        .zadd(redisKey, currentTime, requestId)
        .zcard(redisKey)
        .expire(redisKey, windowSeconds + 2)
        .exec();

      if (!results || results.some((item) => !item || item[0])) {
        throw new Error("Redis rate limiter command failed");
      }

      const requestCount = results[2][1];

      if (requestCount > limit) {
  try {
    await client.incr(statsKey);
  } catch (error) {
    console.error("Rate-limit counter increment failed:", error);
  }

  return res.status(429).json({
          success: false,
          message: `Too many attempts! Please wait ${windowSeconds} seconds before trying again.`,
        });
      }

      return next();
    } catch (error) {
      console.error("Rate limiting middleware error:", error);

      return res.status(503).json({
        success: false,
        message: "Checkout is temporarily unavailable. Please try again shortly.",
      });
    }
  };
}

exports.checkoutRateLimiter = createCheckoutRateLimiter();
exports.createCheckoutRateLimiter = createCheckoutRateLimiter;
