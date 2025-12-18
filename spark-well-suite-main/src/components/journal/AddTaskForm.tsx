import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddTaskFormProps {
  onAdd: (task: {
    title: string;
    timeSpent: number;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    blocker?: string;
  }) => void;
  onClose: () => void;
}

const availableTags = ["DSA", "MERN", "College", "Research", "Frontend", "Backend", "DevOps", "Design"];

export function AddTaskForm({ onAdd, onClose }: AddTaskFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [blocker, setBlocker] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }
    
    if (!timeSpent || parseInt(timeSpent) <= 0) {
      toast({
        title: "Time required",
        description: "Please enter valid time spent.",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      title: title.trim(),
      timeSpent: parseInt(timeSpent),
      difficulty,
      tags: selectedTags,
      blocker: blocker.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setTimeSpent("");
    setDifficulty("Medium");
    setSelectedTags([]);
    setBlocker("");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">Add New Task</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you work on?"
            className="input-focus"
          />
        </div>

        {/* Time & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time Spent (minutes)</Label>
            <Input
              id="time"
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="45"
              min="1"
              className="input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as "Easy" | "Medium" | "Hard")}>
              <SelectTrigger className="input-focus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Blocker */}
        <div className="space-y-2">
          <Label htmlFor="blocker">Blocker (optional)</Label>
          <Input
            id="blocker"
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            placeholder="Any blockers you faced?"
            className="input-focus"
          />
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </form>
    </motion.div>
  );
}