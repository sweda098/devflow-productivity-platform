import axios from "axios";

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id?: string;
  title: string;
  timeSpent: number;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  completed: boolean;
  date: string;
  blocker?: string;
}

export interface HealthMetric {
  _id?: string;
  screenTime: number;
  eyeStrain: number;
  sleepHours: number;
  waterIntake: number;
  date: string;
}

export interface StandupReport {
  _id?: string;
  date: string;
  yesterday: string[];
  today: string[];
  blockers: Array<{
    title: string;
    type: string;
    duration: string;
  }>;
  summary?: string;
  mood?: string;
  hoursWorked?: string;
  productivity?: string;
}

export interface Insight {
  _id?: string;
  title: string;
  description: string;
  type: "productivity" | "health" | "blocker" | "trend";
  priority: "low" | "medium" | "high";
  date: string;
}

// Use environment variable for API base URL (without /api suffix)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),

  getProfile: () => api.get("/auth/profile"),
};

// Tasks API
export const tasksAPI = {
  getTasks: () =>
    api.get<{ message: string; tasks: Task[]; pagination: any }>("/tasks"),
  createTask: (task: Omit<Task, "_id">) => api.post("/tasks", task),
  updateTask: (id: string, task: Partial<Task>) =>
    api.put(`/tasks/${id}`, task),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  getAnalytics: () => api.get("/tasks/analytics"),
};

// Health API
export const healthAPI = {
  getMetrics: () => api.get<HealthMetric[]>("/health"),
  createMetric: (metric: Omit<HealthMetric, "_id">) =>
    api.post("/health", metric),
  updateMetric: (id: string, metric: Partial<HealthMetric>) =>
    api.put(`/health/${id}`, metric),
  deleteMetric: (id: string) => api.delete(`/health/${id}`),
};

// Standup API
export const standupAPI = {
  getReports: () =>
    api.get<{ standupReports: StandupReport[]; pagination: any }>("/standup"),
  createReport: (report: Omit<StandupReport, "_id">) =>
    api.post("/standup", report),
  updateReport: (id: string, report: Partial<StandupReport>) =>
    api.put(`/standup/${id}`, report),
  deleteReport: (id: string) => api.delete(`/standup/${id}`),
  generateReport: () => api.post("/standup/generate"),
};

// Insights API
export const insightsAPI = {
  getInsights: () => api.get<Insight[]>("/insights"),
  createInsight: (insight: Omit<Insight, "_id">) =>
    api.post("/insights", insight),
  updateInsight: (id: string, insight: Partial<Insight>) =>
    api.put(`/insights/${id}`, insight),
  deleteInsight: (id: string) => api.delete(`/insights/${id}`),
};

export default api;
