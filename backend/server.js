const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const healthRoutes = require("./routes/healthRoutes");
const standupRoutes = require("./routes/standupRoutes");
const insightRoutes = require("./routes/insightRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Database Connection
// ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB - devflow");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ======================
// Routes
// ======================

// Health check route
app.get("/api/health-check", (req, res) => {
  res.json({ status: "Server is running", database: "devflow" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/standup", standupRoutes);
app.use("/api/insights", insightRoutes);

// ======================
// Error Handling
// ======================

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ======================
// Server Start
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});