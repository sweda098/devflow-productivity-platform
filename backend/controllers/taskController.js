const Task = require("../models/Task");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, timeSpent, difficulty, tags, blocker } = req.body;
    const userId = req.user?.userId; // Assuming auth middleware sets req.user

    const task = await Task.create({
      user: userId,
      title,
      timeSpent,
      difficulty,
      tags,
      blocker,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL TASKS FOR USER
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, completed, tags, difficulty } = req.query;

    let query = { user: userId };

    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    if (tags) {
      query.tags = { $in: tags.split(",") };
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      message: "Tasks retrieved successfully",
      tasks,
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

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;

    const task = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const task = await Task.findOneAndDelete({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TASK ANALYTICS
exports.getTaskAnalytics = async (req, res) => {
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

    const tasks = await Task.find({
      user: userId,
      createdAt: { $gte: dateFilter },
    });

    // Calculate analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTime = tasks.reduce((sum, t) => sum + t.timeSpent, 0);
    const avgTimePerTask = totalTasks > 0 ? totalTime / totalTasks : 0;

    // Difficulty distribution
    const difficultyCount = tasks.reduce((acc, task) => {
      acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
      return acc;
    }, {});

    // Tag distribution
    const tagCount = tasks.reduce((acc, task) => {
      task.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    // Productivity data for chart (last 7 days)
    const productivityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });

      const hours = dayTasks.reduce((sum, t) => sum + t.timeSpent, 0) / 60; // Convert to hours
      const tasksCount = dayTasks.length;

      productivityData.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        hours: Math.round(hours * 10) / 10,
        tasks: tasksCount,
      });
    }

    res.json({
      message: "Task analytics retrieved successfully",
      analytics: {
        totalTasks,
        completedTasks,
        completionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        totalTimeSpent: totalTime,
        avgTimePerTask,
        difficultyDistribution: difficultyCount,
        tagDistribution: tagCount,
        period,
      },
      productivityData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
