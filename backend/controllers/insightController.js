const Task = require("../models/Task");
const StandupReport = require("../models/StandupReport");
const HealthMetric = require("../models/HealthMetric");

// GET PRODUCTIVITY INSIGHTS
exports.getProductivityInsights = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { period = "week" } = req.query; // week, month, year

    let dateFilter = new Date();
    if (period === "week") {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === "month") {
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    } else if (period === "year") {
      dateFilter.setFullYear(dateFilter.getFullYear() - 1);
    }

    // Get tasks for the period
    const tasks = await Task.find({
      user: userId,
      createdAt: { $gte: dateFilter },
    });

    // Get standup reports for the period
    const standupReports = await StandupReport.find({
      user: userId,
      date: { $gte: dateFilter },
    });

    // Get health metrics for the period
    const healthMetrics = await HealthMetric.find({
      user: userId,
      date: { $gte: dateFilter },
    });

    // Calculate insights
    const insights = {
      taskInsights: calculateTaskInsights(tasks),
      timeInsights: calculateTimeInsights(tasks),
      productivityTrends: calculateProductivityTrends(tasks, standupReports),
      healthCorrelation: calculateHealthCorrelation(healthMetrics, tasks),
      recommendations: generateRecommendations(
        tasks,
        standupReports,
        healthMetrics
      ),
      period,
    };

    res.json({
      message: "Productivity insights retrieved successfully",
      insights,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysTasks = await Task.find({
      user: userId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const todaysStandup = await StandupReport.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow },
    });

    const todaysHealth = await HealthMetric.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow },
    });

    // Weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyTasks = await Task.find({
      user: userId,
      createdAt: { $gte: weekAgo },
    });

    const weeklyStandups = await StandupReport.find({
      user: userId,
      date: { $gte: weekAgo },
    });

    // Calculate stats
    const stats = {
      today: {
        tasksCompleted: todaysTasks.filter((t) => t.completed).length,
        totalTasks: todaysTasks.length,
        timeSpent: todaysTasks.reduce((sum, t) => sum + t.timeSpent, 0),
        standupCompleted: !!todaysStandup,
        healthScore: todaysHealth ? calculateBurnoutScore(todaysHealth) : 0,
      },
      week: {
        totalTasks: weeklyTasks.length,
        completedTasks: weeklyTasks.filter((t) => t.completed).length,
        totalTime: weeklyTasks.reduce((sum, t) => sum + t.timeSpent, 0),
        standupsCompleted: weeklyStandups.length,
        avgTasksPerDay: weeklyTasks.length / 7,
        avgTimePerDay: weeklyTasks.reduce((sum, t) => sum + t.timeSpent, 0) / 7,
      },
      trends: {
        completionRate:
          weeklyTasks.length > 0
            ? (weeklyTasks.filter((t) => t.completed).length /
                weeklyTasks.length) *
              100
            : 0,
        productivityScore: calculateProductivityScore(
          weeklyTasks,
          weeklyStandups
        ),
      },
    };

    res.json({
      message: "Dashboard stats retrieved successfully",
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions for calculations
function calculateTaskInsights(tasks) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const difficultyBreakdown = tasks.reduce((acc, task) => {
    acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
    return acc;
  }, {});

  const tagBreakdown = tasks.reduce((acc, task) => {
    task.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  return {
    totalTasks,
    completedTasks,
    completionRate,
    difficultyBreakdown,
    tagBreakdown,
    avgTasksPerDay: totalTasks / 7, // Assuming weekly data
  };
}

function calculateTimeInsights(tasks) {
  const totalTime = tasks.reduce((sum, t) => sum + t.timeSpent, 0);
  const avgTimePerTask = tasks.length > 0 ? totalTime / tasks.length : 0;

  // Group by difficulty
  const timeByDifficulty = tasks.reduce((acc, task) => {
    if (!acc[task.difficulty]) acc[task.difficulty] = { total: 0, count: 0 };
    acc[task.difficulty].total += task.timeSpent;
    acc[task.difficulty].count += 1;
    return acc;
  }, {});

  Object.keys(timeByDifficulty).forEach((difficulty) => {
    timeByDifficulty[difficulty].avg =
      timeByDifficulty[difficulty].total / timeByDifficulty[difficulty].count;
  });

  return {
    totalTime,
    avgTimePerTask,
    timeByDifficulty,
    avgTimePerDay: totalTime / 7,
  };
}

function calculateProductivityTrends(tasks, standupReports) {
  // Group tasks by day
  const tasksByDay = tasks.reduce((acc, task) => {
    const day = task.createdAt.toISOString().split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {});

  const dailyStats = Object.keys(tasksByDay).map((day) => {
    const dayTasks = tasksByDay[day];
    return {
      date: day,
      tasksCompleted: dayTasks.filter((t) => t.completed).length,
      totalTasks: dayTasks.length,
      timeSpent: dayTasks.reduce((sum, t) => sum + t.timeSpent, 0),
    };
  });

  return {
    dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date)),
    standupConsistency: (standupReports.length / 7) * 100, // Percentage of days with standup
  };
}

function calculateHealthCorrelation(healthMetrics, tasks) {
  if (healthMetrics.length === 0) return null;

  const avgBurnoutScore =
    healthMetrics.reduce((sum, h) => sum + calculateBurnoutScore(h), 0) /
    healthMetrics.length;
  const avgTasksPerDay = tasks.length / 7;

  // Simple correlation calculation
  const correlation =
    avgBurnoutScore > 50 && avgTasksPerDay < 3
      ? "negative"
      : avgBurnoutScore < 30 && avgTasksPerDay > 5
      ? "positive"
      : "neutral";

  return {
    avgBurnoutScore,
    avgTasksPerDay,
    correlation,
    insight:
      correlation === "negative"
        ? "High burnout may be affecting productivity"
        : correlation === "positive"
        ? "Good health correlates with high productivity"
        : "Health and productivity are balanced",
  };
}

function generateRecommendations(tasks, standupReports, healthMetrics) {
  const recommendations = [];

  const completionRate =
    tasks.length > 0
      ? (tasks.filter((t) => t.completed).length / tasks.length) * 100
      : 0;
  if (completionRate < 50) {
    recommendations.push("Focus on completing smaller tasks to build momentum");
  }

  const avgTimePerTask =
    tasks.length > 0
      ? tasks.reduce((sum, t) => sum + t.timeSpent, 0) / tasks.length
      : 0;
  if (avgTimePerTask > 120) {
    // More than 2 hours per task
    recommendations.push(
      "Break down large tasks into smaller, manageable chunks"
    );
  }

  const standupRate = (standupReports.length / 7) * 100;
  if (standupRate < 50) {
    recommendations.push(
      "Maintain daily standup reports for better productivity tracking"
    );
  }

  if (healthMetrics.length > 0) {
    const avgBurnout =
      healthMetrics.reduce((sum, h) => sum + calculateBurnoutScore(h), 0) /
      healthMetrics.length;
    if (avgBurnout > 60) {
      recommendations.push(
        "Take breaks and focus on work-life balance to reduce burnout"
      );
    }
  }

  return recommendations;
}

function calculateBurnoutScore(healthMetric) {
  return Math.round(
    (healthMetric.screenTime / 12) * 30 +
      (healthMetric.eyeStrain / 5) * 30 +
      ((8 - healthMetric.sleepHours) / 8) * 20 +
      ((8 - healthMetric.waterIntake) / 8) * 20
  );
}

function calculateProductivityScore(tasks, standupReports) {
  const completionRate =
    tasks.length > 0
      ? (tasks.filter((t) => t.completed).length / tasks.length) * 100
      : 0;
  const standupRate = (standupReports.length / 7) * 100;
  const avgTasksPerDay = tasks.length / 7;

  return Math.round(
    completionRate * 0.4 +
      standupRate * 0.3 +
      Math.min((avgTasksPerDay / 10) * 100, 100) * 0.3
  );
}
