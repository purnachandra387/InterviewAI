const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  completeTask,
  deleteTask
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

// Using protect middleware to auto-inject the correct user if logged in
router.post("/create", protect, createTask);
router.get("/", protect, getTasks);
router.put("/complete/:id", protect, completeTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
