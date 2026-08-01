const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const seedProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("⚡ Seed script connected to MongoDB...");

    await Product.deleteMany({});
    console.log("🧹 Cleaned old product entries.");

    const flashSaleItem = new Product({
      title: "iPhone 16 Pro Limited Edition",
      price: 119900,
      productId: "iphone-16-pro",
      initialStock: 50,
      currentStock: 50,
    });

    await flashSaleItem.save();
    console.log("📦 Flash sale item successfully injected into the database!");

    await mongoose.connection.close();
    console.log("🔌 Database connection cleanly closed. Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  }
};

seedProduct();
