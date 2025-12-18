const express = require("express");
const router = express.Router();
const {
  updateHealthMetrics,
  getUserHealthMetrics,
  getTodaysHealthMetrics
} = require("../controllers/healthController");

// All routes require authentication (middleware would be added here)

// Update/create health metrics for today
router.post("/", updateHealthMetrics);

// Get user's health metrics with pagination
router.get("/", getUserHealthMetrics);

// Get today's health metrics
router.get("/today", getTodaysHealthMetrics);

module.exports = router;
