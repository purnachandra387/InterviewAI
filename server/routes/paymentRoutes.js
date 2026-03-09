const express = require("express");
const router = express.Router();
const { createOrder, demoUpgrade, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes to ensure req.user is set
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/demo-upgrade", protect, demoUpgrade);

module.exports = router;
