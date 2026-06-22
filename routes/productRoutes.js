// // routes/productRoutes.js
// const express = require("express");
// const router = express.Router();
// const Product = require("../models/Product");

// // @route   GET /api/products/:productId
// // @desc    Fetch a specific product's details and current stock
// router.get("/:productId", async (req, res) => {
//   try {
//     const product = await Product.findOne({ productId: req.params.productId });

//     if (!product) {
//       return res
//         .status(404)
//         .json({ status: "fail", message: "Product not found" });
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         title: product.title,
//         price: product.price,
//         productId: product.productId,
//         currentStock: product.currentStock,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching product:", error);
//     res.status(500).json({ status: "error", message: "Internal server error" });
//   }
// });
// router.post("/:productId/buy", async (req, res) => {
//   try {
//     const { productId } = req.params;

//     // Atomic update operation: Only decrement if currentStock is greater than 0
//     const updatedProduct = await Product.findOneAndUpdate(
//       {
//         productId: productId,
//         currentStock: { $gt: 0 }, // Condition: Must have stock available
//       },
//       {
//         $inc: { currentStock: -1 }, // Action: Decrement currentStock by 1 atomically
//       },
//       {
//         new: true, // Returns the modified document instead of the old one
//         runValidators: true,
//       },
//     );

//     // If no product matched the condition, it means it either doesn't exist or is sold out
//     if (!updatedProduct) {
//       // Check if the product even exists to give a precise error message
//       const productExists = await Product.findOne({ productId });
//       if (!productExists) {
//         return res
//           .status(404)
//           .json({ status: "fail", message: "Product not found" });
//       }
//       return res
//         .status(400)
//         .json({
//           status: "fail",
//           message: "OUT OF STOCK! Better luck next time.",
//         });
//     }

//     // Success! Return the confirmed order details
//     res.status(200).json({
//       status: "success",
//       message: "Purchase successful! Your order is confirmed.",
//       data: {
//         title: updatedProduct.title,
//         remainingStock: updatedProduct.currentStock,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Checkout Error:", error);
//     res
//       .status(500)
//       .json({
//         status: "error",
//         message: "Internal server error during checkout",
//       });
//   }
// });
// module.exports = router;
const express = require("express");
const router = express.Router();
// Import the method directly from orderController
const { getProductDetails } = require("../controllers/orderController");

// Route to fetch details cleanly with Cache-Aside Redis strategy
router.get("/:id", getProductDetails);

module.exports = router;