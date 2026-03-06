const express = require("express");
const router = express.Router();
const { startHRInterview } = require("../controllers/hrController");
const { protect } = require("../middleware/authMiddleware");

// Using protect if you want only authenticated users to access it, though demo works without it too.
router.get("/start", protect, startHRInterview);

module.exports = router;
