const mongoose = require("mongoose");
const Redis = require("ioredis");
const Product = require("../models/Product");
const dotenv = require("dotenv");

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    // 1. Connect to MongoDB with timeout safeguards
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Wait up to 30s to find the server
      connectTimeoutMS: 30000, // Give the SSL handshake 30s to complete
    });
    console.log("🚀 Connected to MongoDB for seeding...");
    // 2. Clear old test entries
    await Product.deleteMany({});
    await redis.flushall();
    console.log("🧹 Cleaned up old database entries.");

    // 3. Create a mock Flash-Sale item (e.g., iPhone 15 Pro)
    const mockProduct = await Product.create({
      name: "iPhone 15 Pro Max (Flash Sale Special)",
      description: "Limited edition high concurrency flash sale deal!",
      price: 1399,
      flashPrice: 499, // Massively discounted!
      stock: 10, // Only 10 units available!
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // Active for 1 hour
      isActive: true,
    });

    console.log(`📦 Product created in MongoDB with ID: ${mockProduct._id}`);

    // 4. Critical Step: Sync Stock to Redis Cloud
    // We track product stock in Redis using a key pattern: product:ID:stock
    const redisKey = `product:${mockProduct._id}:stock`;
    await redis.set(redisKey, mockProduct.stock);

    console.log(`⚡ Redis synced! Stock tracking initialized at: ${redisKey}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
