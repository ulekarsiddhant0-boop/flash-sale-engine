const express = require("express");
const router = express.Router();
const { placeOrder } = require("../controllers/orderController");
const { checkoutRateLimiter } = require("../middleware/rateLimiter");

router.post("/checkout", checkoutRateLimiter, placeOrder);

module.exports = router;
