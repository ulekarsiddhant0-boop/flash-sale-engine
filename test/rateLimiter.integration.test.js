const test = require("node:test");
const assert = require("node:assert/strict");
const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const enabled = Boolean(process.env.REDIS_URL);

test(
  "real Redis enforces checkout limit using isolated test keys",
  { skip: !enabled },
  async () => {
    const Redis = require("ioredis");
    const { createCheckoutRateLimiter } = require("../middleware/rateLimiter");

    const redis = new Redis(process.env.REDIS_URL);
    const testId = `${process.pid}-${Date.now()}`;
    const keyPrefix = `test:rate_limit:checkout:${testId}`;
    const statsKey = `test:stats:rate_limited_requests:${testId}`;
    const ip = `integration-${testId}`;
    const redisKey = `${keyPrefix}:${ip}`;

    function makeResponse() {
      return {
        statusCode: 200,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          this.body = body;
          return this;
        },
      };
    }

    async function sendRequest(limiter) {
      const req = { socket: { remoteAddress: ip } };
      const res = makeResponse();
      let nextCalled = false;

      await limiter(req, res, () => {
        nextCalled = true;
      });

      return { res, nextCalled };
    }

    try {
      assert.equal(await redis.ping(), "PONG");

      const limiter = createCheckoutRateLimiter({
        redisClient: redis,
        limit: 3,
        windowSeconds: 10,
        keyPrefix,
        statsKey,
      });

      for (let i = 0; i < 3; i++) {
        const { res, nextCalled } = await sendRequest(limiter);
        assert.equal(nextCalled, true);
        assert.equal(res.statusCode, 200);
      }

      const { res, nextCalled } = await sendRequest(limiter);

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 429);
      assert.equal(Number(await redis.get(statsKey)), 1);
    } finally {
      await redis.del(redisKey, statsKey);
      redis.disconnect();
    }
  }
);
