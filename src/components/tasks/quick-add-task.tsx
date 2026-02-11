"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask } from "@/actions/task-actions";
import { toast } from "sonner";

interface QuickAddTaskProps {
  projectId: string;
}

export function QuickAddTask({ projectId }: QuickAddTaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("projectId", projectId);
      formData.append("status", "todo");
      formData.append("priority", "medium");

      await createTask(formData);
      setTitle("");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          autoFocus
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-sm"
          disabled={isPending}
          onBlur={() => !title && setIsEditing(false)}
        />
        <Button size="sm" type="submit" disabled={isPending}>
          Add
        </Button>
      </form>
    );
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground h-8 hover:text-foreground px-2"
      size="sm"
      onClick={() => setIsEditing(true)}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Task
    </Button>
  );
}
