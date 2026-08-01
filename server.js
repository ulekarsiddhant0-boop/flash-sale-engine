const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const redis = require("./config/redis");
const orderRoutes = require("./routes/orderRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Flash Sale Server is Healthy!" });
});
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", orderRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🚀 MongoDB Connected Successfully!");
    app.listen(PORT, () => {
      console.log(`🔥 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
