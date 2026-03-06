const express = require("express");
const router = express.Router();
const { startInterview, saveAnswer, submitAnswers, getInterviewHistory, getProgress } = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect, startInterview);
router.post("/:id/answer", protect, saveAnswer);
router.post("/submit", protect, submitAnswers);
router.get("/history", protect, getInterviewHistory);
router.get("/progress", protect, getProgress);

module.exports = router;
