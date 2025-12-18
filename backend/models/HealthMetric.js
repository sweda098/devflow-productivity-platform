const mongoose = require("mongoose");

const healthMetricSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    screenTime: {
      type: Number, // in hours
      default: 0,
    },
    eyeStrain: {
      type: Number, // scale 1-10
      min: 1,
      max: 10,
      default: 1,
    },
    sleepHours: {
      type: Number, // in hours
      default: 0,
    },
    waterIntake: {
      type: Number, // in glasses
      default: 0,
    },
    burnoutScore: {
      type: Number, // scale 1-10
      min: 1,
      max: 10,
      default: 1,
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user and date
healthMetricSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("HealthMetric", healthMetricSchema);
