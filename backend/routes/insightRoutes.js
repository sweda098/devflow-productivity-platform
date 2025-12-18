const express = require("express");
const router = express.Router();
const {
  getProductivityInsights,
  getDashboardStats
} = require("../controllers/insightController");

// All insight routes require authentication (middleware would be added here)
router.get("/productivity", getProductivityInsights);
router.get("/dashboard", getDashboardStats);

module.exports = router;
