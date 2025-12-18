import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskCard, Task } from "@/components/journal/TaskCard";
import { AddTaskForm } from "@/components/journal/AddTaskForm";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Calendar } from "lucide-react";
import { tasksAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Implement user authentication with JWT",
    timeSpent: 120,
    difficulty: "Hard",
    tags: ["MERN", "Backend"],
    completed: true,
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Design dashboard UI components",
    timeSpent: 90,
    difficulty: "Medium",
    tags: ["Frontend", "Design"],
    completed: true,
    date: "2024-01-15",
  },
  {
    id: "3",
    title: "Debug API response handling",
    timeSpent: 45,
    difficulty: "Medium",
    tags: ["MERN", "Backend"],
    blocker: "Waiting for API documentation",
    completed: false,
    date: "2024-01-15",
  },
  {
    id: "4",
    title: "Write unit tests for user service",
    timeSpent: 60,
    difficulty: "Easy",
    tags: ["Backend", "Research"],
    completed: false,
    date: "2024-01-15",
  },
  {
    id: "5",
    title: "Review pull requests",
    timeSpent: 30,
    difficulty: "Easy",
    tags: ["College"],
    completed: true,
    date: "2024-01-14",
  },
  {
    id: "6",
    title: "Optimize database queries",
    timeSpent: 90,
    difficulty: "Hard",
    tags: ["Backend", "DSA"],
    blocker: "Need access to production logs",
    completed: false,
    date: "2024-01-14",
  },
];

const Journal = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from API or fallback to localStorage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Try to load from API first
        const response = await tasksAPI.getTasks();
        const apiTasks: Task[] = response.data.tasks.map((task) => ({
          id: task._id,
          title: task.title,
          timeSpent: task.timeSpent,
          difficulty: task.difficulty,
          tags: task.tags,
          completed: task.completed,
          date: task.date,
          blocker: task.blocker,
        }));
        setTasks(apiTasks);
      } catch (error) {
        // Fallback to localStorage if API fails (user not logged in)
        const savedTasks = localStorage.getItem("userTasks");
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks(initialTasks);
          localStorage.setItem("userTasks", JSON.stringify(initialTasks));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to localStorage when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("userTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleAddTask = async (
    newTask: Omit<Task, "id" | "completed" | "date">
  ) => {
    try {
      const taskData = {
        ...newTask,
        completed: false,
        date: new Date().toISOString().split("T")[0],
      };

      const response = await tasksAPI.createTask(taskData);

      // Map API response to component interface
      const createdTask: Task = {
        id: response.data._id,
        title: response.data.title,
        timeSpent: response.data.timeSpent,
        difficulty: response.data.difficulty,
        tags: response.data.tags,
        completed: response.data.completed,
        date: response.data.date,
        blocker: response.data.blocker,
      };

      setTasks((prev) => [createdTask, ...prev]);
      setShowAddForm(false);

      toast({
        title: "Task added",
        description: "Your task has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error adding task",
        description: "Failed to add the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      await tasksAPI.updateTask(id, { completed: !task.completed });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Failed to update the task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast({
        title: "Task deleted",
        description: "Task has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = (task: Task) => {
    // For now, we'll use a simple prompt. In a real app, you'd open a modal
    const newTitle = prompt("Enter new task title:", task.title);
    if (!newTitle || newTitle.trim() === task.title) return;

    const updatedTask = { ...task, title: newTitle.trim() };
    updateTask(updatedTask);
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      await tasksAPI.updateTask(updatedTask.id, updatedTask);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      toast({
        title: "Task updated",
        description: "Task has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  const todayTasks = filteredTasks.filter(
    (task) => task.date === new Date().toISOString().split("T")[0]
  );
  const previousTasks = filteredTasks.filter(
    (task) => task.date !== new Date().toISOString().split("T")[0]
  );

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    totalTime: tasks.reduce((acc, t) => acc + t.timeSpent, 0),
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Work Journal"
        subtitle="Log and track your daily tasks and progress"
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading your tasks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Work Journal"
      subtitle="Log and track your daily tasks and progress"
    >
      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 grid gap-4 sm:grid-cols-3"
      >
        {[
          { label: "Total Tasks", value: stats.total },
          { label: "Completed", value: stats.completed },
          {
            label: "Time Logged",
            value: `${Math.floor(stats.totalTime / 60)}h ${
              stats.totalTime % 60
            }m`,
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="glass-card flex items-center justify-between p-5"
          >
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className="font-display text-2xl font-semibold text-foreground">
              {stat.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </motion.div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <AddTaskForm
              onAdd={handleAddTask}
              onClose={() => setShowAddForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              Today
            </h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {todayTasks.length} tasks
            </span>
          </div>
          <div className="space-y-4">
            {todayTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
                delay={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Previous Tasks */}
      {previousTasks.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-muted-foreground">
              Previous
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {previousTasks.length} tasks
            </span>
          </div>
          <div className="space-y-4">
            {previousTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
                delay={index}
              />
            ))}
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="rounded-full bg-muted p-6">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
            No tasks found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "all"
              ? "Start by adding your first task!"
              : `No ${filter} tasks yet.`}
          </p>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Journal;
