import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Copy,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  Edit,
  Save,
  X,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { standupAPI, tasksAPI, Task } from "@/services/api";
import { StandupReport } from "@/services/api";

const Standup = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [standupData, setStandupData] = useState<StandupReport | null>(null);
  const [editedData, setEditedData] = useState<Partial<StandupReport>>({});
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [quickNotes, setQuickNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchStandupReport();
    fetchRecentTasks();
  }, []);

  const fetchStandupReport = async () => {
    try {
      setIsLoading(true);
      const response = await standupAPI.getReports();
      const reports = response.data.standupReports || [];
      const today = new Date().toISOString().split("T")[0];
      const todaysReport = reports.find(
        (report: StandupReport) => report.date && report.date.startsWith(today)
      );

      if (todaysReport) {
        setStandupData(todaysReport);
        setEditedData(todaysReport);
      } else {
        // Generate new report if none exists
        await generateReport();
      }
    } catch (error) {
      console.error("Error fetching standup report:", error);
      toast({
        title: "Error",
        description: "Failed to load standup report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      const response = await standupAPI.generateReport();
      const generatedReport = response.data.generatedReport;

      // Check if the generated report has meaningful content
      const hasContent =
        generatedReport &&
        ((Array.isArray(generatedReport.yesterday) &&
          generatedReport.yesterday.length > 0) ||
          (Array.isArray(generatedReport.today) &&
            generatedReport.today.length > 0) ||
          (Array.isArray(generatedReport.blockers) &&
            generatedReport.blockers.length > 0));

      if (hasContent) {
        setStandupData(generatedReport);
        setEditedData(generatedReport);
        toast({
          title: "Report Generated",
          description: "Your stand-up report has been generated successfully.",
        });
      } else {
        // Use mock data as example if no real data available
        const mockReport = {
          date: new Date().toISOString().split("T")[0],
          yesterday: [
            "Completed user authentication system implementation",
            "Fixed responsive design issues on mobile devices",
            "Updated API documentation for new endpoints",
          ],
          today: [
            "Work on analytics dashboard implementation",
            "Review and merge pending pull requests",
            "Plan sprint retrospective meeting",
          ],
          blockers: [
            {
              title: "Waiting for API documentation approval",
              type: "Process",
              duration: "2 days",
            },
            {
              title: "Database performance optimization needed",
              type: "Technical",
              duration: "1 day",
            },
          ],
          summary:
            "Productive day with good progress on core features. Need to address blockers to maintain momentum.",
        };
        setStandupData(mockReport);
        setEditedData(mockReport);
        toast({
          title: "Example Report Loaded",
          description:
            "No tasks found. Here's an example stand-up report you can edit.",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      // Fallback to mock data on error
      const mockReport = {
        date: new Date().toISOString().split("T")[0],
        yesterday: [
          "Completed user authentication system implementation",
          "Fixed responsive design issues on mobile devices",
          "Updated API documentation for new endpoints",
        ],
        today: [
          "Work on analytics dashboard implementation",
          "Review and merge pending pull requests",
          "Plan sprint retrospective meeting",
        ],
        blockers: [
          {
            title: "Waiting for API documentation approval",
            type: "Process",
            duration: "2 days",
          },
          {
            title: "Database performance optimization needed",
            type: "Technical",
            duration: "1 day",
          },
        ],
        summary:
          "Productive day with good progress on core features. Need to address blockers to maintain momentum.",
      };
      setStandupData(mockReport);
      setEditedData(mockReport);
      toast({
        title: "Example Report Loaded",
        description:
          "Unable to generate report from tasks. Here's an example you can edit.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReport = async () => {
    try {
      if (standupData?._id) {
        await standupAPI.updateReport(standupData._id, editedData);
        toast({
          title: "Report Updated",
          description: "Your stand-up report has been updated successfully.",
        });
      } else {
        const response = await standupAPI.createReport(
          editedData as Omit<StandupReport, "_id">
        );
        setStandupData(response.data.standupReport);
      }
      setStandupData(editedData as StandupReport);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save standup report.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditedData(standupData || {});
    setIsEditing(false);
  };

  const addBlocker = () => {
    const newBlockers = [
      ...(editedData.blockers || []),
      { title: "", type: "", duration: "" },
    ];
    setEditedData({ ...editedData, blockers: newBlockers });
  };

  const updateBlocker = (index: number, field: string, value: string) => {
    const newBlockers = [...(editedData.blockers || [])];
    newBlockers[index] = { ...newBlockers[index], [field]: value };
    setEditedData({ ...editedData, blockers: newBlockers });
  };

  const removeBlocker = (index: number) => {
    const newBlockers = (editedData.blockers || []).filter(
      (_, i) => i !== index
    );
    setEditedData({ ...editedData, blockers: newBlockers });
  };

  const addQuickNote = () => {
    if (newNote.trim()) {
      setQuickNotes([...quickNotes, newNote.trim()]);
      setNewNote("");
    }
  };

  const removeQuickNote = (index: number) => {
    setQuickNotes(quickNotes.filter((_, i) => i !== index));
  };

  const fetchRecentTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const response = await tasksAPI.getTasks();
      // Handle different response formats (array or object with tasks property)
      const tasks = Array.isArray(response.data)
        ? response.data
        : response.data?.tasks || [];

      // Get tasks from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTasks = tasks
        .filter(
          (task: any) => new Date(task.createdAt || task.date) >= sevenDaysAgo
        )
        .slice(0, 10); // Limit to 10 most recent
      setRecentTasks(recentTasks);
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load recent tasks.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const addTaskToYesterday = (task: any) => {
    const taskText = `Completed "${task.title}" (${task.timeSpent}min, ${task.difficulty})`;
    const newYesterday = [...(editedData.yesterday || []), taskText];
    setEditedData({ ...editedData, yesterday: newYesterday });
    toast({
      title: "Task Added",
      description: "Task added to yesterday's accomplishments.",
    });
  };

  const addTaskToToday = (task: any) => {
    const taskText = `Work on "${task.title}" (${task.timeSpent}min, ${task.difficulty})`;
    const newToday = [...(editedData.today || []), taskText];
    setEditedData({ ...editedData, today: newToday });
    toast({
      title: "Task Added",
      description: "Task added to today's plan.",
    });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleGenerate = () => {
    generateReport();
  };

  const handleCopy = () => {
    const reportText = `
📅 Daily Stand-up - ${standupData.date}

✅ Yesterday's Accomplishments:
${standupData.yesterday.map((item) => `• ${item}`).join("\n")}

📋 Today's Plan:
${standupData.today.map((item) => `• ${item}`).join("\n")}

🚧 Blockers:
${standupData.blockers
  .map((b) => `• ${b.title} (${b.type} - ${b.duration})`)
  .join("\n")}
    `.trim();

    navigator.clipboard.writeText(reportText);
    toast({
      title: "Copied to Clipboard",
      description: "Your stand-up report has been copied.",
    });
  };

  return (
    <DashboardLayout
      title="Stand-up Report"
      subtitle="Auto-generate your daily stand-up summary"
    >
      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium text-foreground">
            {standupData?.date || currentDate}
          </span>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveReport}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isGenerating ? "animate-spin" : ""
                  }`}
                />
                Regenerate
              </Button>
              <Button
                variant="outline"
                onClick={() => fetchRecentTasks()}
                disabled={isLoadingTasks}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isLoadingTasks ? "animate-spin" : ""
                  }`}
                />
                Refresh Tasks
              </Button>
              <Button onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Report
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {standupData ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Yesterday's Accomplishments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-success/10 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Yesterday's Accomplishments
              </h3>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                {(editedData.yesterday || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl bg-success/5 p-3"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-success" />
                    <Textarea
                      value={item}
                      onChange={(e) => {
                        const newYesterday = [...(editedData.yesterday || [])];
                        newYesterday[index] = e.target.value;
                        setEditedData({
                          ...editedData,
                          yesterday: newYesterday,
                        });
                      }}
                      className="min-h-[60px] resize-none border-none bg-transparent p-0 text-sm text-foreground focus-visible:ring-0"
                      placeholder="Enter accomplishment..."
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newYesterday = [...(editedData.yesterday || []), ""];
                    setEditedData({ ...editedData, yesterday: newYesterday });
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Accomplishment
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {(standupData?.yesterday || []).map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3 rounded-xl bg-success/5 p-3"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm text-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Today's Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Today's Plan
              </h3>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                {(editedData.today || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl bg-primary/5 p-3"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <Textarea
                      value={item}
                      onChange={(e) => {
                        const newToday = [...(editedData.today || [])];
                        newToday[index] = e.target.value;
                        setEditedData({ ...editedData, today: newToday });
                      }}
                      className="min-h-[60px] resize-none border-none bg-transparent p-0 text-sm text-foreground focus-visible:ring-0"
                      placeholder="Enter today's plan..."
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newToday = [...(editedData.today || []), ""];
                    setEditedData({ ...editedData, today: newToday });
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plan Item
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {(standupData?.today || []).map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3 rounded-xl bg-primary/5 p-3"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Blockers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-danger/10 p-2.5">
                <AlertCircle className="h-5 w-5 text-danger" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Current Blockers
              </h3>
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                {(standupData?.blockers || []).length} active
              </span>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                {(editedData.blockers || []).map((blocker, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-danger/20 bg-danger/5 p-4"
                  >
                    <div className="space-y-3">
                      <Input
                        value={blocker.title}
                        onChange={(e) =>
                          updateBlocker(index, "title", e.target.value)
                        }
                        placeholder="Blocker title..."
                        className="font-medium"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={blocker.type}
                          onChange={(e) =>
                            updateBlocker(index, "type", e.target.value)
                          }
                          placeholder="Type (e.g., Technical)"
                          className="flex-1"
                        />
                        <Input
                          value={blocker.duration}
                          onChange={(e) =>
                            updateBlocker(index, "duration", e.target.value)
                          }
                          placeholder="Duration (e.g., 2 days)"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBlocker(index)}
                          className="px-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addBlocker}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Blocker
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(standupData?.blockers || []).map((blocker, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="rounded-xl border border-danger/20 bg-danger/5 p-6"
                  >
                    <h4 className="font-medium text-foreground">
                      {blocker.title}
                    </h4>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">
                        {blocker.type}
                      </span>
                      <span>Blocked for {blocker.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Tasks Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card pt-2 pb-4 pl-4 pr-4 -mt-4"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2.5">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Recent Tasks
              </h3>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                {recentTasks.length} available
              </span>
            </div>
            {isLoadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            task.completed
                              ? "bg-green-500/10 text-green-600"
                              : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {task.completed ? "Completed" : "Pending"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {task.timeSpent}min • {task.difficulty}
                        </span>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTaskToYesterday(task)}
                          disabled={task.completed}
                          className="text-xs"
                        >
                          Add to Yesterday
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTaskToToday(task)}
                          disabled={!task.completed}
                          className="text-xs"
                        >
                          Add to Today
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent tasks found. Add tasks in the Journal to see them
                here.
              </p>
            )}
          </motion.div>

          {/* Summary & Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-accent/10 p-2.5">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Summary & Notes
              </h3>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Daily Summary
                  </label>
                  <Textarea
                    value={editedData.summary || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, summary: e.target.value })
                    }
                    placeholder="Write a summary of your day, progress, challenges, or any additional notes..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mood/Energy Level
                    </label>
                    <Input
                      value={editedData.mood || ""}
                      onChange={(e) =>
                        setEditedData({ ...editedData, mood: e.target.value })
                      }
                      placeholder="e.g., High Energy, Focused, Tired"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hours Worked
                    </label>
                    <Input
                      value={editedData.hoursWorked || ""}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          hoursWorked: e.target.value,
                        })
                      }
                      placeholder="e.g., 8.5 hours"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Productivity Rating
                    </label>
                    <Input
                      value={editedData.productivity || ""}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          productivity: e.target.value,
                        })
                      }
                      placeholder="e.g., 85%, High, Low"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-muted/50 p-5">
                <p className="leading-relaxed text-foreground mb-4">
                  {standupData?.summary ||
                    "No summary provided yet. Click Edit to add your daily summary and notes."}
                </p>
                {(standupData?.mood ||
                  standupData?.hoursWorked ||
                  standupData?.productivity) && (
                  <div className="flex flex-wrap gap-2">
                    {standupData?.mood && (
                      <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                        {standupData.mood}
                      </span>
                    )}
                    {standupData?.hoursWorked && (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {standupData.hoursWorked}
                      </span>
                    )}
                    {standupData?.productivity && (
                      <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                        {standupData.productivity}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-2.5">
                <Plus className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Quick Notes
              </h3>
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-500">
                {quickNotes.length} notes
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type any additional details, reminders, or notes here..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && addQuickNote()}
                />
                <Button onClick={addQuickNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {quickNotes.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {quickNotes.map((note, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-3"
                    >
                      <span className="text-sm text-foreground flex-1 mr-2">
                        {note}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuickNote(index)}
                        className="h-6 w-6 p-0 hover:bg-purple-500/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="rounded-full bg-muted p-6">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
            No Report Generated Yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Click the generate button to create your daily stand-up report based
            on your journal entries.
          </p>
          <Button className="mt-6" onClick={handleGenerate}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Standup;
