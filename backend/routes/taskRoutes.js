const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createTask,
  getUserTasks,
  updateTask,
  deleteTask,
  getTaskAnalytics
} = require("../controllers/taskController");

// All task routes require authentication
router.post("/", auth, createTask);
router.get("/", auth, getUserTasks);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);
router.get("/analytics", auth, getTaskAnalytics);

module.exports = router;
