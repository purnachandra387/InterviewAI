const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    getNotifications,
    markAllRead,
    markOneRead,
    deleteNotification,
    getAchievements,
    getCoachTip,
    searchHistory,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.post("/mark-read", protect, markAllRead);
router.patch("/:id/read", protect, markOneRead);
router.delete("/:id", protect, deleteNotification);
router.get("/achievements", protect, getAchievements);
router.get("/coach-tip", protect, getCoachTip);
router.get("/search", protect, searchHistory);

module.exports = router;
