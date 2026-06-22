const express = require("express");
const router = express.Router();
const { placeOrder } = require("../controllers/orderController");
const { checkoutRateLimiter } = require("../middleware/rateLimiter");

// Checkout API Route protected by our Redis Rate Limiter
router.post("/checkout", checkoutRateLimiter, placeOrder);

module.exports = router;
