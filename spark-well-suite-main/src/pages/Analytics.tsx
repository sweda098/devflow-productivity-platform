import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { tasksAPI } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const weeklyData = [
  { day: "Mon", hours: 6.5, tasks: 8 },
  { day: "Tue", hours: 7.2, tasks: 10 },
  { day: "Wed", hours: 5.8, tasks: 6 },
  { day: "Thu", hours: 8.1, tasks: 12 },
  { day: "Fri", hours: 7.5, tasks: 9 },
  { day: "Sat", hours: 4.2, tasks: 5 },
  { day: "Sun", hours: 3.0, tasks: 3 },
];

const hourlyProductivity = [
  { hour: "6AM", productivity: 20 },
  { hour: "8AM", productivity: 45 },
  { hour: "10AM", productivity: 85 },
  { hour: "12PM", productivity: 60 },
  { hour: "2PM", productivity: 55 },
  { hour: "4PM", productivity: 75 },
  { hour: "6PM", productivity: 50 },
  { hour: "8PM", productivity: 30 },
];

const tagDistribution = [
  { name: "MERN", value: 35, color: "hsl(156, 30%, 45%)" },
  { name: "Frontend", value: 25, color: "hsl(260, 40%, 60%)" },
  { name: "Backend", value: 20, color: "hsl(15, 80%, 65%)" },
  { name: "DSA", value: 12, color: "hsl(45, 90%, 55%)" },
  { name: "Other", value: 8, color: "hsl(220, 15%, 70%)" },
];

const difficultyData = [
  { difficulty: "Easy", count: 15, color: "hsl(156, 45%, 50%)" },
  { difficulty: "Medium", count: 22, color: "hsl(45, 90%, 55%)" },
  { difficulty: "Hard", count: 8, color: "hsl(0, 70%, 60%)" },
];

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dynamicTagData, setDynamicTagData] = useState([]);
  const [dynamicDifficultyData, setDynamicDifficultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await tasksAPI.getAnalytics();
        const data = response.data;

        setAnalyticsData(data.analytics);

        // Transform productivity data for charts
        setWeeklyData(data.productivityData);

        // Transform tag distribution for pie chart
        const tagColors = ["hsl(156, 30%, 45%)", "hsl(260, 40%, 60%)", "hsl(15, 80%, 65%)", "hsl(45, 90%, 55%)", "hsl(220, 15%, 70%)"];
        const tagData = Object.entries(data.analytics.tagDistribution).map(([name, value], index) => ({
          name,
          value,
          color: tagColors[index % tagColors.length]
        }));
        setDynamicTagData(tagData);

        // Transform difficulty distribution for bar chart
        const difficultyColors = {
          Easy: "hsl(156, 45%, 50%)",
          Medium: "hsl(45, 90%, 55%)",
          Hard: "hsl(0, 70%, 60%)"
        };
        const difficultyData = Object.entries(data.analytics.difficultyDistribution).map(([difficulty, count]) => ({
          difficulty,
          count,
          color: difficultyColors[difficulty] || "hsl(220, 15%, 70%)"
        }));
        setDynamicDifficultyData(difficultyData);

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Visualize your productivity patterns and trends"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Visualize your productivity patterns and trends"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading analytics: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Visualize your productivity patterns and trends"
    >
      {/* Peak Hours Chart */}
      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
            Peak Productivity Hours
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyProductivity}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(156, 30%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(156, 30%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis
                  dataKey="hour"
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 15%, 90%)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="productivity"
                  stroke="hsl(156, 30%, 45%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProd)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="h-3 w-3 rounded-full bg-primary" />
            Your peak productivity is between 10 AM - 12 PM
          </div>
        </motion.div>

        {/* Weekly Consistency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
            Weekly Consistency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 15%, 90%)",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="hsl(156, 30%, 45%)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tag Distribution and Difficulty */}
      <div className="mb-8 grid gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 lg:col-span-1"
        >
          <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
            Task Categories
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tagDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tagDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 15%, 90%)",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {tagDistribution.map((tag) => (
              <div key={tag.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-xs text-muted-foreground">{tag.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
            Task Difficulty Distribution
          </h3>
          <div className="space-y-4">
            {dynamicDifficultyData.map((item) => {
              const percentage = analyticsData ? (item.count / analyticsData.totalTasks) * 100 : 0;
              return (
                <div key={item.difficulty}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {item.difficulty}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} tasks ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Total Tasks", value: analyticsData ? analyticsData.totalTasks.toString() : "0" },
              { label: "Avg. per Day", value: analyticsData ? (analyticsData.totalTasks / 7).toFixed(1) : "0.0" },
              { label: "Completion Rate", value: analyticsData ? `${Math.round(analyticsData.completionRate)}%` : "0%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-muted/50 p-4 text-center"
              >
                <p className="font-display text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Completion Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
          Task Completion Trends (Last 7 Days)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis
                dataKey="day"
                stroke="hsl(215, 16%, 47%)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(215, 16%, 47%)"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 90%)",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="hsl(260, 40%, 60%)"
                strokeWidth={3}
                dot={{ fill: "hsl(260, 40%, 60%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Analytics;
