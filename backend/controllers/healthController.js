const HealthMetric = require("../models/HealthMetric");

// UPDATE HEALTH METRICS
exports.updateHealthMetrics = async (req, res) => {
  try {
    const {
      date,
      screenTime,
      eyeStrain,
      sleepHours,
      waterIntake,
      burnoutScore,
    } = req.body;
    const userId = req.user.userId; // Assuming auth middleware sets req.user

    const healthMetric = await HealthMetric.findOneAndUpdate(
      { user: userId, date: new Date(date) },
      {
        screenTime,
        eyeStrain,
        sleepHours,
        waterIntake,
        burnoutScore,
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "Health metrics updated successfully",
      healthMetric,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER HEALTH METRICS
exports.getUserHealthMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const query = { user: userId };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const healthMetrics = await HealthMetric.find(query).sort({ date: -1 });
    res.json({
      message: "Health metrics retrieved successfully",
      healthMetrics,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TODAY'S HEALTH METRICS
exports.getTodaysHealthMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const healthMetric = await HealthMetric.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: "Today's health metrics retrieved successfully",
      healthMetric,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
