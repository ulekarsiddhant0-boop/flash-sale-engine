// seed.js
const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const seedProduct = async () => {
  try {
    // 1. Open a temporary connection to your cloud database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("⚡ Seed script connected to MongoDB...");

    // 2. Clear out any existing products so we don't duplicate them
    await Product.deleteMany({});
    console.log("🧹 Cleaned old product entries.");

    // 3. Define our flash sale smartphone item
    const flashSaleItem = new Product({
      title: "iPhone 16 Pro Limited Edition",
      price: 119900,
      productId: "iphone-16-pro",
      initialStock: 50,
      currentStock: 50, // This is the inventory count that will tick down to 0
    });

    // 4. Save the product into MongoDB Atlas
    await flashSaleItem.save();
    console.log("📦 Flash sale item successfully injected into the database!");

    // 5. Safely close the database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection cleanly closed. Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  }
};

// Run the script
seedProduct();
