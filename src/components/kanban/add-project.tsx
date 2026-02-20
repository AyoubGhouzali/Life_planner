"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createProject } from "@/actions/project-actions";
import { toast } from "sonner";

interface AddProjectProps {
  columnId: string;
}

export function AddProject({ columnId }: AddProjectProps) {
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
      formData.append("columnId", columnId);
      formData.append("priority", "medium");

      await createProject(formData);
      toast.success("Project created");
      setTitle("");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
      <Card className="shadow-sm border-primary/50">
        <CardContent className="p-2">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              autoFocus
              placeholder="Project title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm"
              disabled={isPending}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Project"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground h-9 hover:text-foreground"
      size="sm"
      onClick={() => setIsEditing(true)}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Project
    </Button>
  );
}
