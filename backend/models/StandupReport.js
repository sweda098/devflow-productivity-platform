const mongoose = require("mongoose");

const standupReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // Changed to String to match frontend date format
      default: () => new Date().toISOString().split('T')[0],
    },
    yesterday: {
      type: [String], // Changed to array of strings
      required: true,
      default: [],
    },
    today: {
      type: [String], // Changed to array of strings
      required: true,
      default: [],
    },
    blockers: [{
      title: { type: String, required: true },
      type: { type: String, default: "Technical" },
      duration: { type: String, default: "Ongoing" },
    }],
    tasksCompleted: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }],
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "tired", "stressed"],
      default: "good",
    },
    summary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user and date
standupReportSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("StandupReport", standupReportSchema);
