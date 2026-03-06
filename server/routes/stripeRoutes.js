const express = require("express");
const router = express.Router();
const { createCheckoutSession, webhook, demoUpgrade } = require("../controllers/stripeController");
const { protect } = require("../middleware/authMiddleware");

// Stripe Checkout redirect route (protected)
router.post("/create-checkout-session", protect, createCheckoutSession);

// Demo upgrade fallback route (protected)
router.post("/demo-upgrade", protect, demoUpgrade);

// Webhook is mounted directly in server.js before express.json()
// to preserve the raw body needed for verifying Stripe signatures.

module.exports = router;
