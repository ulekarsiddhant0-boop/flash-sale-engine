const mongoose = require("mongoose");
const Redis = require("ioredis");
const Product = require("../models/Product");
const dotenv = require("dotenv");

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

const seedData = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000, 
    });
    console.log("🚀 Connected to MongoDB for seeding...");
    
    await Product.deleteMany({});
    await redis.flushall();
    console.log("🧹 Cleaned up old database entries.");

  
    const mockProduct = await Product.create({
      name: "iPhone 15 Pro Max (Flash Sale Special)",
      description: "Limited edition high concurrency flash sale deal!",
      price: 1399,
      flashPrice: 499, 
      stock: 10, 
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      isActive: true,
    });

    console.log(`📦 Product created in MongoDB with ID: ${mockProduct._id}`);

  
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
