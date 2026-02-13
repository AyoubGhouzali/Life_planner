"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createTask } from "@/actions/task-actions";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
}

interface Column {
  projects: Project[];
}

interface Board {
  columns: Column[];
}

interface Area {
  id: string;
  name: string;
  boards: Board[];
}

interface QuickAddTaskProps {
  areas: Area[];
  onSuccess?: () => void;
}

export function QuickAddTask({ areas, onSuccess }: QuickAddTaskProps) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Add this for internal state if needed, but not used here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) {
        toast.error("Title and Project are required");
        return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("projectId", projectId);
      formData.append("status", "todo");
      formData.append("priority", "medium");

      await createTask(formData);
      toast.success("Task created");
      setTitle("");
      // Keep project selected for subsequent adds? Yes.
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-1">
      <div className="flex-1">
        <Input
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-background"
        />
      </div>
      <Select value={projectId} onValueChange={setProjectId}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Select Project" />
        </SelectTrigger>
        <SelectContent>
            {areas.map(area => {
                const projects = area.boards.flatMap(b => b.columns.flatMap(c => c.projects));
                if (projects.length === 0) return null;
                
                return (
                 <SelectGroup key={area.id}>
                    <SelectLabel>{area.name}</SelectLabel>
                    {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                 </SelectGroup>
                )
            })}
        </SelectContent>
      </Select>
      <Button type="submit" size="icon" disabled={loading || !title || !projectId}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
