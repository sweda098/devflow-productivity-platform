const StandupReport = require("../models/StandupReport");
const Task = require("../models/Task");

// CREATE STANDUP REPORT
exports.createStandupReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { yesterday, today, blockers, tasksCompleted, mood, date, summary } = req.body;

    // Calculate total time spent from completed tasks
    let totalTimeSpent = 0;
    if (tasksCompleted && tasksCompleted.length > 0) {
      const tasks = await Task.find({
        _id: { $in: tasksCompleted },
        user: userId,
      });
      totalTimeSpent = tasks.reduce((sum, task) => sum + task.timeSpent, 0);
    }

    const standupReport = await StandupReport.create({
      user: userId,
      date: date || new Date().toISOString().split('T')[0],
      yesterday: Array.isArray(yesterday) ? yesterday : [],
      today: Array.isArray(today) ? today : [],
      blockers: Array.isArray(blockers) ? blockers : [],
      tasksCompleted,
      totalTimeSpent,
      mood,
      summary,
    });

    res.status(201).json({
      message: "Standup report created successfully",
      standupReport,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER STANDUP REPORTS
exports.getUserStandupReports = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    let query = { user: userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const standupReports = await StandupReport.find(query)
      .populate("tasksCompleted", "title timeSpent difficulty tags")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StandupReport.countDocuments(query);

    res.json({
      message: "Standup reports retrieved successfully",
      standupReports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TODAY'S STANDUP REPORT
exports.getTodaysStandupReport = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const standupReport = await StandupReport.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow },
    }).populate("tasksCompleted", "title timeSpent difficulty tags");

    if (!standupReport) {
      return res.json({
        message: "No standup report for today",
        standupReport: null,
      });
    }

    res.json({
      message: "Today's standup report retrieved successfully",
      standupReport,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE STANDUP REPORT
exports.updateStandupReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;

    // Recalculate total time if tasks changed
    if (updates.tasksCompleted) {
      const tasks = await Task.find({
        _id: { $in: updates.tasksCompleted },
        user: userId,
      });
      updates.totalTimeSpent = tasks.reduce(
        (sum, task) => sum + task.timeSpent,
        0
      );
    }

    const standupReport = await StandupReport.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    ).populate("tasksCompleted", "title timeSpent difficulty tags");

    if (!standupReport) {
      return res.status(404).json({ message: "Standup report not found" });
    }

    res.json({
      message: "Standup report updated successfully",
      standupReport,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE STANDUP REPORT
exports.deleteStandupReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const standupReport = await StandupReport.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!standupReport) {
      return res.status(404).json({ message: "Standup report not found" });
    }

    res.json({
      message: "Standup report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GENERATE STANDUP REPORT FROM TASKS
exports.generateStandupReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get tasks from the target date
    const tasks = await Task.find({
      user: userId,
      createdAt: { $gte: targetDate, $lt: nextDay },
    });

    // Separate completed and pending tasks
    const completedTasks = tasks.filter((task) => task.completed);
    const pendingTasks = tasks.filter((task) => !task.completed);

    // Generate yesterday's accomplishments as array
    const yesterday =
      completedTasks.length > 0
        ? completedTasks.map(
            (t) => `Completed: ${t.title} (${t.timeSpent} hours)`
          )
        : ["No tasks completed yesterday"];

    // Generate today's plan as array
    const today =
      pendingTasks.length > 0
        ? pendingTasks.map(
            (t) => `Work on: ${t.title} (${t.difficulty} priority)`
          )
        : ["Focus on new assignments and code review"];

    // Identify blockers as array of objects
    const blockers = tasks
      .filter((task) => task.blocker)
      .map((task) => ({
        title: task.title,
        type: task.tags?.[0] || "Technical",
        duration: "Ongoing",
      }));

    // If no blockers found, add a default one
    if (blockers.length === 0) {
      blockers.push({
        title: "No current blockers identified",
        type: "None",
        duration: "N/A",
      });
    }

    res.json({
      message: "Standup report generated successfully",
      generatedReport: {
        date: targetDate.toISOString().split("T")[0],
        yesterday,
        today,
        blockers,
        tasksCompleted: completedTasks.map((t) => t._id),
        totalTimeSpent: completedTasks.reduce((sum, t) => sum + t.timeSpent, 0),
        mood: "good", // Default mood
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
