const express = require("express");
const router = express.Router();
const { getProductDetails } = require("../controllers/orderController");

router.get("/:id", getProductDetails);

module.exports = router;
