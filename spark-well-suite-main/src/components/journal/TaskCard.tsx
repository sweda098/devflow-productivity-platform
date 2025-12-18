import { motion } from "framer-motion";
import { Clock, Tag, AlertCircle, CheckCircle2, Trash2, Edit } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  timeSpent: number;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  blocker?: string;
  completed: boolean;
  date: string;
}

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (task: Task) => void;
  delay?: number;
}

const difficultyColors = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-danger/10 text-danger border-danger/20",
};

export function TaskCard({ task, onToggleComplete, onDelete, onUpdate, delay = 0 }: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      whileHover={{ scale: 1.01 }}
      className={`glass-card p-5 transition-all ${
        task.completed ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete?.(task.id)}
          className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
            task.completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary"
          }`}
        >
          {task.completed && <CheckCircle2 className="h-4 w-4" />}
        </button>

        <div className="flex-1">
          <h3
            className={`font-medium text-foreground ${
              task.completed ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{task.timeSpent}m</span>
            </div>

            {/* Difficulty */}
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                difficultyColors[task.difficulty]
              }`}
            >
              {task.difficulty}
            </span>

            {/* Tags */}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Blocker */}
          {task.blocker && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4" />
              <span>{task.blocker}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onUpdate?.(task)}
              className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <Edit className="h-3 w-3" />
              Update
            </button>
            <button
              onClick={() => onDelete?.(task.id)}
              className="flex items-center gap-1 rounded-md bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
