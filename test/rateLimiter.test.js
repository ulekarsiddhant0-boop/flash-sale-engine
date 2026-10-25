
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createCheckoutRateLimiter,
} = require("../middleware/rateLimiter");

function createFakeRedis({ fail = false } = {}) {
  const entries = new Map();
  let limitedRequests = 0;

  const client = {
    multi() {
      const commands = [];

      const transaction = {
        zremrangebyscore(key, _min, max) {
          commands.push(() => {
            const set = entries.get(key) || [];
            entries.set(
              key,
              set.filter((item) => item.score > max)
            );
          });
          return transaction;
        },

        zadd(key, score, member) {
          commands.push(() => {
            const set = entries.get(key) || [];
            set.push({ score, member });
            entries.set(key, set);
          });
          return transaction;
        },

        zcard(key) {
          commands.push(() => entries.get(key)?.length || 0);
          return transaction;
        },

        expire() {
          commands.push(() => 1);
          return transaction;
        },

        async exec() {
          if (fail) throw new Error("Fake Redis failure");

          return commands.map((command) => {
            try {
              return [null, command()];
            } catch (error) {
              return [error, null];
            }
          });
        },
      };

      return transaction;
    },

    async incr() {
      if (fail) throw new Error("Fake Redis failure");
      limitedRequests++;
      return limitedRequests;
    },

    getLimitedRequests() {
      return limitedRequests;
    },
  };

  return client;
}

function makeRequest() {
  return {
    headers: {},
    socket: { remoteAddress: "test-client" },
  };
}

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
  const req = makeRequest();
  const res = makeResponse();
  let nextCalled = false;

  await limiter(req, res, () => {
    nextCalled = true;
  });

  return { res, nextCalled };
}

test("first three checkout requests are allowed", async () => {
  const redis = createFakeRedis();
  const limiter = createCheckoutRateLimiter({ redisClient: redis });

  for (let i = 0; i < 3; i++) {
    const { res, nextCalled } = await sendRequest(limiter);
    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  }
});

test("fourth checkout request is rate limited", async () => {
  const redis = createFakeRedis();
  const limiter = createCheckoutRateLimiter({ redisClient: redis });

  for (let i = 0; i < 3; i++) {
    await sendRequest(limiter);
  }

  const { res, nextCalled } = await sendRequest(limiter);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 429);
  assert.equal(redis.getLimitedRequests(), 1);
});

test("Redis failure blocks checkout with 503", async () => {
  const redis = createFakeRedis({ fail: true });
  const limiter = createCheckoutRateLimiter({ redisClient: redis });

  const { res, nextCalled } = await sendRequest(limiter);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 503);
});

test("rate-limited checkout returns 429 even if stats counter fails", async () => {
  const redis = createFakeRedis();
  redis.incr = async () => {
    throw new Error("Fake counter failure");
  };

  const limiter = createCheckoutRateLimiter({
    redisClient: redis,
  });

  for (let i = 0; i < 3; i++) {
    await sendRequest(limiter);
  }

  const { res, nextCalled } = await sendRequest(limiter);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.success, false);
});

test("concurrent checkout requests allow only three requests", async () => {
  const redis = createFakeRedis();
  const limiter = createCheckoutRateLimiter({ redisClient: redis });

  const results = await Promise.all(
    Array.from({ length: 10 }, () => sendRequest(limiter))
  );

  const allowed = results.filter((result) => result.nextCalled);
  const limited = results.filter((result) => result.res.statusCode === 429);

  assert.equal(allowed.length, 3);
  assert.equal(limited.length, 7);
});
