const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["productivity", "health", "burnout", "time_management", "goal_progress"],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Flexible data structure for different insight types
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user and type
insightSchema.index({ user: 1, type: 1, date: -1 });

module.exports = mongoose.model("Insight", insightSchema);
