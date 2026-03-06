const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getEntries, createEntry, updateEntry, deleteEntry } = require("../controllers/journalController");

router.get("/", protect, getEntries);
router.post("/", protect, createEntry);
router.put("/:id", protect, updateEntry);
router.delete("/:id", protect, deleteEntry);

module.exports = router;
