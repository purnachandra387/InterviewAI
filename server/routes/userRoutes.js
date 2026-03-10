const express = require("express");
const router = express.Router();
const { getProfile, getBadges } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);
router.get("/badges", protect, getBadges);

module.exports = router;
