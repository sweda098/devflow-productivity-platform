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

// Database connection
mongoose.connect("mongodb://localhost:27017/devflowdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB - devflowdb"))
.catch((err) => console.error("MongoDB connection error:", err));

// Health check route (must be before other /api/health routes)
app.get("/api/health-check", (req, res) => {
  res.json({ status: "Server is running", database: "devflowdb" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/standup", standupRoutes);
app.use("/api/insights", insightRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: devflowdb`);
});
