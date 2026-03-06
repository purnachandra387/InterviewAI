const express = require("express");
const router = express.Router();
const { getProfile, getBadges } = require("../controllers/userController");

router.get("/profile", getProfile);
router.get("/badges", getBadges);

module.exports = router;
