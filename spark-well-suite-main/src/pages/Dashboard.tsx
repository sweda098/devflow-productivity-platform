import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskCard, Task } from "@/components/journal/TaskCard";
import { InsightsList } from "@/components/insights/InsightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Target,
  Flame,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { tasksAPI, insightsAPI, healthAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Helper function to calculate streak
const calculateStreak = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((t) => t.completed);
  if (completedTasks.length === 0) return 0;

  // Group tasks by date
  const tasksByDate = completedTasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Get unique dates with completed tasks, sorted descending
  const dates = Object.keys(tasksByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];

  // Check if today has completed tasks
  if (!dates.includes(today)) {
    return 0; // No tasks completed today, streak broken
  }

  // Count consecutive days
  for (let i = 0; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (dates[i] === expectedDate.toISOString().split("T")[0]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Helper function to generate productivity data
const generateProductivityData = (tasks: Task[]) => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const dayTasks = tasks.filter((task) => task.date === dateStr);
    const hours = dayTasks.reduce((sum, task) => sum + task.timeSpent, 0) / 60;
    const tasksCount = dayTasks.length;

    last7Days.push({
      day: dayName,
      hours: Math.round(hours * 10) / 10,
      tasks: tasksCount,
    });
  }
  return last7Days;
};

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    hoursLogged: 0,
    focusScore: 0,
    streak: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [productivityData, setProductivityData] = useState<
    { day: string; hours: number; tasks: number }[]
  >([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysPlan, setTodaysPlan] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");
  const [mappedTasks, setMappedTasks] = useState<Task[]>([]);
  const [lastScheduleResetDate, setLastScheduleResetDate] =
    useState<string>("");

  // Load today's schedule and check for daily reset
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedLastResetDate = localStorage.getItem(
      "dashboardScheduleLastReset"
    );
    const savedTodaysPlan = localStorage.getItem("dashboardTodaysPlan");

    // Reset schedule if it's a new day
    if (savedLastResetDate !== today) {
      setTodaysPlan([]);
      setLastScheduleResetDate(today);
      localStorage.setItem("dashboardScheduleLastReset", today);
      localStorage.removeItem("dashboardTodaysPlan");
    } else {
      // Load saved schedule
      if (savedTodaysPlan) {
        try {
          const parsedPlan = JSON.parse(savedTodaysPlan);
          setTodaysPlan(parsedPlan);
        } catch (error) {
          console.error("Error parsing saved today's plan:", error);
          setTodaysPlan([]);
        }
      }
      setLastScheduleResetDate(savedLastResetDate || today);
    }
  }, []);

  // Save today's plan to localStorage whenever it changes
  useEffect(() => {
    if (todaysPlan.length > 0) {
      localStorage.setItem("dashboardTodaysPlan", JSON.stringify(todaysPlan));
    }
  }, [todaysPlan]);

  const addTaskToPlan = () => {
    if (!newTask.trim() || !newTime.trim()) return;

    // Convert time to 12-hour format
    const [hours, minutes] = newTime.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const timeString = `${displayHour}:${minutes} ${ampm}`;

    const newPlanTask = {
      time: timeString,
      task: newTask.trim(),
      status: "upcoming",
    };

    setTodaysPlan((prev) => [...prev, newPlanTask]);
    setNewTask("");
    setNewTime("");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let tasks: Task[] = [];
        let analytics = null;

        // Try to load from API first
        try {
          const [tasksResponse, analyticsResponse] = await Promise.all([
            tasksAPI.getTasks(),
            tasksAPI.getAnalytics()
          ]);

          const apiTasks = Array.isArray(tasksResponse.data)
            ? tasksResponse.data
            : tasksResponse.data?.tasks || [];
          tasks = apiTasks.map((task: any) => ({
            id: task._id || task.id,
            title: task.title,
            timeSpent: task.timeSpent,
            difficulty: task.difficulty,
            tags: task.tags,
            completed: task.completed,
            date: task.date,
            blocker: task.blocker,
          }));

          analytics = analyticsResponse.data.analytics;
          setAnalyticsData(analytics);

          // Use analytics productivity data instead of local calculation
          setProductivityData(analyticsResponse.data.productivityData);
        } catch (apiError) {
          // Fallback to localStorage if API fails (user not logged in)
          const savedTasks = localStorage.getItem("userTasks");
          if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            // Generate productivity data from local tasks
            const productivityData = generateProductivityData(tasks);
            setProductivityData(productivityData);
          }
        }

        setMappedTasks(tasks);

        // Calculate stats
        const completedTasks = tasks.filter((t) => t.completed).length;
        const totalHours = tasks.reduce((acc, t) => acc + t.timeSpent, 0) / 60;
        const focusScore =
          tasks.length > 0
            ? Math.min(100, Math.round((completedTasks / tasks.length) * 100))
            : 0;

        // Calculate streak (consecutive days with completed tasks)
        const streak = calculateStreak(tasks);

        setStats({
          tasksCompleted: completedTasks,
          hoursLogged: Math.round(totalHours * 10) / 10,
          focusScore,
          streak,
        });

        // Get recent tasks (last 3, sorted by date)
        const sortedTasks = tasks.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentTasks(sortedTasks.slice(0, 3));
      } catch (error: any) {
        // Don't show error message for authentication errors, let interceptor handle it
        if (error?.response?.status !== 401) {
          toast({
            title: "Error loading dashboard",
            description: "Unable to load dashboard data.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Update task status based on current time
  useEffect(() => {
    const updateTaskStatus = () => {
      const now = new Date();
      setTodaysPlan((prev) =>
        prev.map((task) => {
          const [time, ampm] = task.time.split(" ");
          const [hours, minutes] = time.split(":");
          let hour = parseInt(hours);
          if (ampm === "PM" && hour !== 12) hour += 12;
          if (ampm === "AM" && hour === 12) hour = 0;

          const taskTime = new Date();
          taskTime.setHours(hour, parseInt(minutes), 0, 0);

          let status = "upcoming";
          if (taskTime < now) {
            status = "done";
          } else if (
            Math.abs(taskTime.getTime() - now.getTime()) <
            30 * 60 * 1000
          ) {
            // Within 30 minutes
            status = "current";
          }

          return { ...task, status };
        })
      );
    };

    updateTaskStatus();
    const interval = setInterval(updateTaskStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Welcome back! Here's your productivity overview."
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! Here's your productivity overview."
    >
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={stats.tasksCompleted}
          subtitle="This week"
          icon={CheckCircle2}
          trend={{ value: 12, positive: true }}
          color="success"
          delay={0}
        />
        <StatCard
          title="Hours Logged"
          value={stats.hoursLogged.toFixed(1)}
          subtitle="This week"
          icon={Clock}
          trend={{ value: 8, positive: true }}
          color="primary"
          delay={1}
        />
        <StatCard
          title="Focus Score"
          value={`${stats.focusScore}%`}
          subtitle="Above average"
          icon={Target}
          trend={{ value: 5, positive: true }}
          color="accent"
          delay={2}
        />
        <StatCard
          title="Streak"
          value={`${stats.streak} days`}
          subtitle="Personal best!"
          icon={Flame}
          color="warning"
          delay={3}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Productivity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Productivity Trend
              </h3>
              <p className="text-sm text-muted-foreground">
                Hours worked this week
              </p>
            </div>
            {productivityData.some((d) => d.hours > 0) && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">+15%</span>
              </div>
            )}
          </div>
          <div className="h-64">
            {productivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(156, 30%, 45%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(156, 30%, 45%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 15%, 90%)"
                  />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(215, 16%, 47%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 16%, 47%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 15%, 90%)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px -2px hsl(220, 15%, 80%, 0.2)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(156, 30%, 45%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <TrendingUp className="h-12 w-12 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  No activity yet
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start logging your tasks to see your productivity trends here!
                </p>
                <Link
                  to="/journal"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Add Your First Task
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Today's Schedule
              </h3>
              <p className="text-sm text-muted-foreground">
                Plan your day and stay on track
              </p>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Add new task form */}
          <div className="mb-6 flex gap-3">
            <div className="flex-1">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="h-10"
                placeholder="Time"
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="h-10"
                placeholder="Task description"
              />
            </div>
            <Button onClick={addTaskToPlan} size="sm" className="h-10 px-4">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Schedule list */}
          <div className="space-y-3">
            {todaysPlan.length > 0 ? (
              todaysPlan.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 rounded-lg p-3 ${
                    item.status === "done"
                      ? "bg-muted/50 opacity-60"
                      : item.status === "current"
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-card"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        item.status === "done"
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {item.task}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "done" && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    {item.status === "current" && (
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  Schedule your tasks for the day
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your day by adding tasks with specific times to stay
                  organized and productive!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Tasks and Insights */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            Recent Tasks
          </h3>
          <div className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} delay={index} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  No tasks yet
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your productivity journey by adding your first task!
                </p>
                <Link
                  to="/journal"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Add Your First Task
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <InsightsList tasks={mappedTasks} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
