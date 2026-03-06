const express = require("express");
const router = express.Router();
const { getRoadmap } = require("../controllers/roadmapController");

router.post("/generate", getRoadmap);

module.exports = router;
