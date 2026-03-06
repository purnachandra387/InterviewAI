const express = require("express");
const router = express.Router();
const {
    generateQuestions,
    getHistory,
    getStats,
    deleteHistory,
} = require("../controllers/aiController");
const { getCompanyPrep } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// All AI routes require authentication
router.post("/generate", protect, generateQuestions);
router.get("/history", protect, getHistory);
router.get("/stats", protect, getStats);
router.delete("/history/:id", protect, deleteHistory);
router.post("/company-prep", protect, getCompanyPrep);

module.exports = router;
