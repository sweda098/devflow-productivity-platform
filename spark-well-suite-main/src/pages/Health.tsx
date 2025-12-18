import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HealthMetricCard } from "@/components/health/HealthMetricCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { tasksAPI } from "@/services/api";
import {
  Monitor,
  Eye,
  Moon,
  Droplets,
  Coffee,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  timeSpent: number;
  difficulty: string;
  tags: string[];
  completed: boolean;
  date?: string; // Optional for localStorage tasks
  createdAt?: string; // From API timestamps
  blocker?: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  urgent: boolean;
}

const initialReminders: Reminder[] = [
  {
    id: "1",
    title: "Take a break",
    description: "You've been working for 2 hours straight",
    icon: Coffee,
    urgent: true,
  },
  {
    id: "2",
    title: "Eye rest",
    description: "Follow the 20-20-20 rule",
    icon: Eye,
    urgent: false,
  },
  {
    id: "3",
    title: "Drink water",
    description: "Stay hydrated for better focus",
    icon: Droplets,
    urgent: true,
  },
  {
    id: "4",
    title: "Stretch",
    description: "Time for a quick stretch break",
    icon: CheckCircle,
    urgent: false,
  },
];

const Health = () => {
  const { toast } = useToast();
  const [screenTime, setScreenTime] = useState(6);
  const [eyeStrain, setEyeStrain] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [waterIntake, setWaterIntake] = useState(5);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastResetDate, setLastResetDate] = useState<string>("");

  // Load completed reminders and check for daily reset
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedLastResetDate = localStorage.getItem("healthRemindersLastReset");
    const savedCompletedReminders = localStorage.getItem("completedHealthReminders");

    // Reset reminders if it's a new day
    if (savedLastResetDate !== today) {
      setCompletedReminders([]);
      setReminders(initialReminders);
      setLastResetDate(today);
      localStorage.setItem("healthRemindersLastReset", today);
      localStorage.removeItem("completedHealthReminders");
    } else {
      // Load saved completed reminders
      if (savedCompletedReminders) {
        try {
          const parsedCompleted = JSON.parse(savedCompletedReminders);
          setCompletedReminders(parsedCompleted);
          // Filter out completed reminders from active reminders
          setReminders(initialReminders.filter(r => !parsedCompleted.some((cr: Reminder) => cr.id === r.id)));
        } catch (error) {
          console.error("Error parsing saved completed reminders:", error);
          setCompletedReminders([]);
          setReminders(initialReminders);
        }
      }
      setLastResetDate(savedLastResetDate || today);
    }
  }, []);

  // Save completed reminders to localStorage whenever they change
  useEffect(() => {
    if (completedReminders.length > 0) {
      localStorage.setItem("completedHealthReminders", JSON.stringify(completedReminders));
    }
  }, [completedReminders]);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await tasksAPI.getTasks();
        const apiTasks = Array.isArray(response.data)
          ? response.data
          : response.data.tasks || [];
        const mappedTasks: Task[] = apiTasks.map((task: any) => ({
          id: task._id || task.id,
          title: task.title,
          timeSpent: task.timeSpent,
          difficulty: task.difficulty,
          tags: task.tags,
          completed: task.completed,
          date: task.date,
          createdAt: task.createdAt,
          blocker: task.blocker,
        }));
        setTasks(mappedTasks);
      } catch (error) {
        // Fallback to localStorage if API fails
        const savedTasks = localStorage.getItem("userTasks");
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Calculate task stats
  const taskStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.completed).length,
      pendingTasks: tasks.filter((t) => !t.completed).length,
      todayTasks: tasks.filter((t) => {
        // Check if task was created today using createdAt field
        if (t.createdAt) {
          const taskDate = new Date(t.createdAt).toISOString().split("T")[0];
          return taskDate === today;
        }
        // Fallback to date field if it exists (for localStorage tasks)
        return t.date === today;
      }).length,
      totalTime: tasks.reduce((acc, t) => acc + t.timeSpent, 0),
    };
  }, [tasks]);

  // Calculate burnout risk
  const burnoutScore = Math.round(
    (screenTime / 12) * 30 +
      (eyeStrain / 5) * 30 +
      ((8 - sleepHours) / 8) * 20 +
      ((8 - waterIntake) / 8) * 20
  );

  const burnoutStatus =
    burnoutScore < 30 ? "low" : burnoutScore < 60 ? "medium" : "high";

  const statusColors = {
    low: "text-success bg-success/10 border-success/20",
    medium: "text-warning bg-warning/10 border-warning/20",
    high: "text-danger bg-danger/10 border-danger/20",
  };

  const handleDismissReminder = (id: string) => {
    const reminderToComplete = reminders.find((r) => r.id === id);
    if (reminderToComplete) {
      setCompletedReminders((prev) => [...prev, reminderToComplete]);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Reminder completed",
        description: "Great job taking care of yourself!",
      });
    }
  };

  return (
    <DashboardLayout
      title="Health & Well-Being"
      subtitle="Track your physical health and prevent burnout"
    >
      {/* Burnout Risk Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="glass-card p-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div
                className={`rounded-2xl border p-4 ${statusColors[burnoutStatus]}`}
              >
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Burnout Risk Assessment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Based on your current health metrics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-foreground">
                  {burnoutScore}%
                </p>
                <p
                  className={`mt-1 rounded-full border px-3 py-1 text-xs font-medium ${statusColors[burnoutStatus]}`}
                >
                  {burnoutStatus.toUpperCase()} RISK
                </p>
              </div>

              {/* Progress Ring */}
              <div className="relative h-20 w-20">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      burnoutStatus === "low"
                        ? "hsl(var(--success))"
                        : burnoutStatus === "medium"
                        ? "hsl(var(--warning))"
                        : "hsl(var(--danger))"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${burnoutScore}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Health Metrics */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <HealthMetricCard
          title="Screen Time"
          value={screenTime}
          max={12}
          unit="hrs"
          icon={Monitor}
          color={
            screenTime > 8 ? "danger" : screenTime > 6 ? "warning" : "success"
          }
          onChange={setScreenTime}
          delay={0}
        />
        <HealthMetricCard
          title="Eye Strain"
          value={eyeStrain}
          max={5}
          unit="/ 5"
          icon={Eye}
          color={
            eyeStrain > 3 ? "danger" : eyeStrain > 2 ? "warning" : "success"
          }
          onChange={setEyeStrain}
          delay={1}
        />
        <HealthMetricCard
          title="Sleep Hours"
          value={sleepHours}
          max={10}
          unit="hrs"
          icon={Moon}
          color={
            sleepHours < 6 ? "danger" : sleepHours < 7 ? "warning" : "success"
          }
          onChange={setSleepHours}
          delay={2}
        />
        <HealthMetricCard
          title="Water Intake"
          value={waterIntake}
          max={8}
          unit="glasses"
          icon={Droplets}
          color={
            waterIntake < 4 ? "danger" : waterIntake < 6 ? "warning" : "success"
          }
          onChange={setWaterIntake}
          delay={3}
        />
      </div>

      {/* Task-Based Health Insights */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Work-Life Balance Insights
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">
                  {taskStats.todayTasks}
                </p>
                <p className="text-sm text-muted-foreground">Tasks Today</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">
                  {taskStats.pendingTasks}
                </p>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">
                  {Math.floor(taskStats.totalTime / 60)}h{" "}
                  {taskStats.totalTime % 60}m
                </p>
                <p className="text-sm text-muted-foreground">Time Logged</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">
                  {taskStats.totalTasks > 0
                    ? Math.round(
                        (taskStats.completedTasks / taskStats.totalTasks) * 100
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>

            {/* Health recommendations based on task data */}
            <div className="mt-6 space-y-3">
              {taskStats.pendingTasks > 10 && (
                <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-3 border border-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <p className="text-sm text-foreground">
                    You have {taskStats.pendingTasks} pending tasks. Consider
                    prioritizing and breaking them down to reduce stress.
                  </p>
                </div>
              )}
              {taskStats.totalTime > 480 && ( // More than 8 hours
                <div className="flex items-center gap-3 rounded-lg bg-accent/10 p-3 border border-accent/20">
                  <Clock className="h-5 w-5 text-accent" />
                  <p className="text-sm text-foreground">
                    You've logged over 8 hours today. Remember to take regular
                    breaks and maintain work-life balance.
                  </p>
                </div>
              )}
              {taskStats.todayTasks === 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3 border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <p className="text-sm text-foreground">
                    No tasks logged today. Start your productive day by adding
                    your first task in the Journal!
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Reminders */}
      <div className="grid gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Active Reminders
            </h3>
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {reminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`glass-card flex items-center gap-4 p-4 ${
                    reminder.urgent ? "border-l-4 border-l-accent" : ""
                  }`}
                >
                  <div
                    className={`rounded-xl p-3 ${
                      reminder.urgent
                        ? "bg-accent/10 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <reminder.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {reminder.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {reminder.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={reminder.urgent ? "default" : "outline"}
                    onClick={() => handleDismissReminder(reminder.id)}
                  >
                    Done
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {reminders.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card flex flex-col items-center justify-center p-8 text-center"
              >
                <CheckCircle className="h-12 w-12 text-success" />
                <p className="mt-4 font-medium text-foreground">
                  All caught up!
                </p>
                <p className="text-sm text-muted-foreground">
                  No active reminders
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Completed Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            Completed Today
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {completedReminders.map((reminder, index) => (
                <motion.div
                  key={`completed-${reminder.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card flex items-center gap-4 p-4 bg-success/5 border border-success/20"
                >
                  <div className="rounded-xl p-3 bg-success/10 text-success">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground line-through">
                      {reminder.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You have completed this reminder! Great job taking care of
                      yourself.
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {completedReminders.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="rounded-full bg-muted p-4 mb-4">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-2">
                  No completed reminders yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Complete some reminders to see them here!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Daily Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            Wellness Tips
          </h3>
          <div className="glass-card p-6">
            <div className="space-y-4">
              {[
                {
                  title: "20-20-20 Rule",
                  description:
                    "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.",
                },
                {
                  title: "Pomodoro Technique",
                  description:
                    "Work for 25 minutes, then take a 5-minute break. Take a longer break after 4 sessions.",
                },
                {
                  title: "Hydration Goal",
                  description:
                    "Aim for 8 glasses of water daily. Keep a water bottle at your desk as a reminder.",
                },
                {
                  title: "Sleep Hygiene",
                  description:
                    "Avoid screens 1 hour before bed. Aim for 7-9 hours of quality sleep.",
                },
              ].map((tip, index) => (
                <div
                  key={index}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <h4 className="font-medium text-foreground">{tip.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Health;
