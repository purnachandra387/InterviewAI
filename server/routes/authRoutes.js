const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes (require JWT)
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
