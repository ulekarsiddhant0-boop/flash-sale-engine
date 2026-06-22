// config/redis.js
const Redis = require("ioredis");
require("dotenv").config();

if (!process.env.REDIS_URL) {
  console.error("❌ CRITICAL: REDIS_URL is missing in your .env file!");
  process.exit(1);
}

// Connect to your Upstash Cloud Redis cluster
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("⚡ Redis Cloud Connected Successfully!");
});

redis.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err);
});

module.exports = redis;
