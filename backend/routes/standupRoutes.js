const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createStandupReport,
  getUserStandupReports,
  getTodaysStandupReport,
  updateStandupReport,
  deleteStandupReport,
  generateStandupReport
} = require("../controllers/standupController");

// All routes require authentication
router.post("/", auth, createStandupReport);
router.get("/", auth, getUserStandupReports);
router.get("/today", auth, getTodaysStandupReport);
router.post("/generate", auth, generateStandupReport);
router.put("/:id", auth, updateStandupReport);
router.delete("/:id", auth, deleteStandupReport);

module.exports = router;
