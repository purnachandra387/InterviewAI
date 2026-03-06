const express = require("express");
const router = express.Router();
const {
    startInterview,
    evaluateAnswer,
    saveSession,
    getMockHistory,
    getMockSession,
} = require("../controllers/mockController");
const { protect } = require("../middleware/authMiddleware");

// All mock routes require authentication
router.post("/start", protect, startInterview);
router.post("/evaluate", protect, evaluateAnswer);
router.post("/save", protect, saveSession);
router.get("/history", protect, getMockHistory);
router.get("/history/:id", protect, getMockSession);

module.exports = router;
