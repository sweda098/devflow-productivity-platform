import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface HealthMetricCardProps {
  title: string;
  value: number;
  max: number;
  unit: string;
  icon: LucideIcon;
  color: "primary" | "accent" | "success" | "warning" | "danger";
  onChange?: (value: number) => void;
  delay?: number;
}

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    fill: "bg-primary",
  },
  accent: {
    bg: "bg-accent/10",
    text: "text-accent",
    fill: "bg-accent",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    fill: "bg-success",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    fill: "bg-warning",
  },
  danger: {
    bg: "bg-danger/10",
    text: "text-danger",
    fill: "bg-danger",
  },
};

export function HealthMetricCard({
  title,
  value,
  max,
  unit,
  icon: Icon,
  color,
  onChange,
  delay = 0,
}: HealthMetricCardProps) {
  const percentage = (value / max) * 100;
  const styles = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${styles.bg}`}>
          <Icon className={`h-6 w-6 ${styles.text}`} />
        </div>
        <span className={`text-sm font-medium ${styles.text}`}>
          {value} / {max} {unit}
        </span>
      </div>

      <h3 className="mt-4 font-medium text-foreground">{title}</h3>

      {/* Progress Bar */}
      <div className="mt-3 h-2 rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: delay * 0.1 + 0.2 }}
          className={`h-full rounded-full ${styles.fill}`}
        />
      </div>

      {/* Slider */}
      {onChange && (
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="mt-4 w-full cursor-pointer accent-primary"
        />
      )}
    </motion.div>
  );
}
