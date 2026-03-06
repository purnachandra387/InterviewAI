const express = require("express");
const router = express.Router();

const {
  getDailyChallenge
} = require("../controllers/challengeController");

router.get("/today", getDailyChallenge);

module.exports = router;
