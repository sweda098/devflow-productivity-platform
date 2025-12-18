import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Coffee,
  Bot,
  Send,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Insight {
  id: string;
  type: "warning" | "tip" | "achievement" | "suggestion";
  title: string;
  description: string;
  reason: string;
}

interface InsightCardProps {
  insight: Insight;
  delay?: number;
}

const typeStyles = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning/20",
    iconColor: "text-warning",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-primary/10",
    border: "border-primary/20",
    iconColor: "text-primary",
  },
  achievement: {
    icon: TrendingUp,
    bg: "bg-success/10",
    border: "border-success/20",
    iconColor: "text-success",
  },
  suggestion: {
    icon: Coffee,
    bg: "bg-accent/10",
    border: "border-accent/20",
    iconColor: "text-accent",
  },
};

export function InsightCard({ insight, delay = 0 }: InsightCardProps) {
  const style = typeStyles[insight.type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={`rounded-2xl border ${style.border} ${style.bg} p-5`}
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-xl bg-card p-2.5 ${style.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{insight.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {insight.description}
          </p>
          <div className="mt-3 rounded-lg bg-card/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Why this insight: </span>
              {insight.reason}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface AIBotProps {
  tasks: any[];
  healthData?: any[];
}

function generateAIInsight(tasks: any[], userQuery?: string): Insight {
  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  // Handle various types of questions
  if (userQuery) {
    const lowerQuery = userQuery.toLowerCase();

    // Get user name from localStorage for personalized greetings
    const userInfo = localStorage.getItem('user');
    const userName = userInfo ? JSON.parse(userInfo).name : 'there';

    // Greeting detection
    const greetingWords = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetingWords.some(word => lowerQuery.includes(word)) ||
                      lowerQuery.includes('my name is') ||
                      lowerQuery.includes("i'm") ||
                      lowerQuery.includes('i am') ||
                      lowerQuery.includes(userName.toLowerCase());

    if (isGreeting) {
      return {
        id: Date.now().toString(),
        type: "tip",
        title: `Hello ${userName}!`,
        description: `Nice to meet you! I'm your AI productivity assistant. I can help you with productivity tips, task management, focus techniques, motivation, and work-related insights. What would you like to know?`,
        reason: "Personalized greeting to make our conversation more friendly and engaging.",
      };
    }

    // Motivation questions
    if (
      lowerQuery.includes("motivat") ||
      lowerQuery.includes("inspire") ||
      lowerQuery.includes("encourage")
    ) {
      return {
        id: Date.now().toString(),
        type: "tip",
        title: "Motivation Boost",
        description:
          "Start small! Break your goals into tiny, achievable steps. Celebrate each completion with a small reward. Remember, consistency beats perfection every time.",
        reason:
          "Motivation comes from momentum - small wins build confidence and drive.",
      };
    }

    // App usage questions
    if (
      lowerQuery.includes("how") &&
      (lowerQuery.includes("use") ||
        lowerQuery.includes("add") ||
        lowerQuery.includes("log"))
    ) {
      return {
        id: Date.now().toString(),
        type: "tip",
        title: "How to Use the App",
        description:
          "Go to the Journal page to add tasks with time spent, difficulty, and tags. Use the Dashboard to track your progress and get AI insights. The Health page helps monitor your well-being.",
        reason:
          "Regular logging helps you understand your work patterns and improve productivity.",
      };
    }

    // Focus and concentration questions
    if (
      lowerQuery.includes("focus") ||
      lowerQuery.includes("concentrat") ||
      lowerQuery.includes("distract")
    ) {
      return {
        id: Date.now().toString(),
        type: "tip",
        title: "Focus Techniques",
        description:
          "Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. Put your phone on silent and close unnecessary tabs. Set clear intentions before starting.",
        reason:
          "Focused work sessions prevent burnout and improve overall productivity.",
      };
    }

    // Stress and burnout questions
    if (
      lowerQuery.includes("stress") ||
      lowerQuery.includes("burnout") ||
      lowerQuery.includes("overwhelm")
    ) {
      return {
        id: Date.now().toString(),
        type: "suggestion",
        title: "Managing Stress",
        description:
          "Take regular breaks, prioritize your tasks, and set realistic goals. Remember to disconnect after work hours. Your well-being is as important as your productivity.",
        reason:
          "Sustainable productivity requires balance between work and rest.",
      };
    }

    // Goal setting questions
    if (
      lowerQuery.includes("goal") ||
      lowerQuery.includes("target") ||
      lowerQuery.includes("achieve")
    ) {
      return {
        id: Date.now().toString(),
        type: "tip",
        title: "Goal Setting Tips",
        description:
          "Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Break large goals into smaller milestones. Track your progress regularly.",
        reason: "Clear goals provide direction and motivation for your work.",
      };
    }

    // Time management questions
    if (
      lowerQuery.includes("time") &&
      (lowerQuery.includes("manag") || lowerQuery.includes("organize"))
    ) {
      return {
        id: Date.now().toString(),
        type: "tip",
        title: "Time Management",
        description:
          "Use time blocking to schedule your day. Prioritize high-impact tasks first. Avoid multitasking - focus on one thing at a time for better results.",
        reason:
          "Effective time management maximizes your productivity and reduces stress.",
      };
    }

    // Productivity analysis
    if (lowerQuery.includes("productivity")) {
      return {
        id: Date.now().toString(),
        type: "tip",
        title: "Productivity Analysis",
        description: `Your current completion rate is ${completionRate.toFixed(
          0
        )}%. ${
          completionRate > 70
            ? "Great job! You're highly productive."
            : "Consider breaking tasks into smaller chunks for better focus."
        }`,
        reason: "Based on your task completion patterns and historical data.",
      };
    }

    // Break recommendations
    if (lowerQuery.includes("break")) {
      return {
        id: Date.now().toString(),
        type: "suggestion",
        title: "Break Recommendation",
        description:
          "You've been working intensively. Take a 15-minute break to recharge.",
        reason:
          "Research shows regular breaks improve focus and prevent burnout.",
      };
    }

    // If query doesn't match any supported categories, respond with "not trained"
    return {
      id: Date.now().toString(),
      type: "warning",
      title: "I'm not trained for this",
      description: "I'm sorry, but I'm only trained to help with productivity, task management, and work-related insights. I can't assist with this topic.",
      reason: "My training is focused specifically on productivity and work patterns.",
    };
  }

  // Default insights based on data
  if (completionRate > 80) {
    return {
      id: Date.now().toString(),
      type: "achievement",
      title: "Excellent Productivity!",
      description: `You're completing ${completionRate.toFixed(
        0
      )}% of your tasks. Keep up the great work!`,
      reason: "Based on your high task completion rate this week.",
    };
  } else if (completionRate < 50 && totalTasks > 0) {
    return {
      id: Date.now().toString(),
      type: "warning",
      title: "Productivity Alert",
      description:
        "Your task completion rate is below average. Consider reviewing your blockers.",
      reason: "Based on current task completion patterns.",
    };
  } else {
    return {
      id: Date.now().toString(),
      type: "tip",
      title: "Focus Tip",
      description:
        "Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.",
      reason:
        "This technique has been proven to improve productivity and reduce mental fatigue.",
    };
  }
}

export function AIBot({ tasks, healthData }: AIBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! I'm your AI productivity assistant. I can help you analyze your work patterns and provide personalized insights. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const insight = generateAIInsight(tasks, input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `${insight.title}: ${insight.description}\n\n${insight.reason}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <Card className="h-96 flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-3">
        {/* Quick questions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickQuestion("How's my productivity?")}
            className="text-xs"
          >
            Productivity
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickQuestion("How do I stay motivated?")}
            className="text-xs"
          >
            Motivation
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickQuestion("Any tips for focus?")}
            className="text-xs"
          >
            Focus Tips
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickQuestion("How do I manage stress?")}
            className="text-xs"
          >
            Stress Help
          </Button>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your productivity..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function InsightsList({
  tasks = [],
  healthData = [],
}: {
  tasks?: any[];
  healthData?: any[];
}) {
  const [showBot, setShowBot] = useState(false);

  const insights: Insight[] = [
    {
      id: "1",
      type: "warning",
      title: "Productivity Dip Detected",
      description:
        "Your afternoon sessions have been 40% less productive this week.",
      reason:
        "Based on task completion rate between 2-5 PM compared to morning sessions.",
    },
    {
      id: "2",
      type: "tip",
      title: "Take a Break",
      description:
        "You've been working for 3 hours straight. Consider a 15-minute break.",
      reason:
        "Continuous work periods over 90 minutes reduce focus and increase errors.",
    },
    {
      id: "3",
      type: "achievement",
      title: "Consistency Streak!",
      description: "You've logged tasks for 7 days in a row. Keep it up!",
      reason:
        "Daily journaling improves self-awareness and helps identify patterns.",
    },
    {
      id: "4",
      type: "suggestion",
      title: "Hydration Reminder",
      description: "You've only logged 3 glasses of water today. Aim for 8.",
      reason: "Low water intake correlates with your reported fatigue levels.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          AI Insights
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBot(!showBot)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {showBot ? "Hide AI Bot" : "Ask AI Bot"}
        </Button>
      </div>

      {showBot ? (
        <AIBot tasks={tasks} healthData={healthData} />
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} delay={index} />
          ))}
        </div>
      )}
    </div>
  );
}
