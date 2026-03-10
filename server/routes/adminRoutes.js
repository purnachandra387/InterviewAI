const express = require("express");
const router = express.Router();
const { getAdminOverview } = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/authMiddleware");

router.get("/overview", protect, requireRole("admin"), getAdminOverview);

module.exports = router;
