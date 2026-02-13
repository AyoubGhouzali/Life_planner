"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProject, deleteProject } from "@/actions/project-actions";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Tag, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskList } from "@/components/tasks/task-list";
import { NoteList } from "@/components/notes/note-list";
import { Separator } from "@/components/ui/separator";

interface ProjectDetailProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetail({ project, open, onOpenChange }: ProjectDetailProps) {
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [priority, setPriority] = useState(project.priority);

  async function handleUpdate(updates: any) {
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("title", updates.title || title);
      formData.append("description", updates.description || description);
      formData.append("priority", updates.priority || priority);
      formData.append("columnId", project.column_id);

      await updateProject(project.id, formData);
      toast.success("Project updated");
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    setIsPending(true);
    try {
      await deleteProject(project.id);
      toast.success("Project deleted");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="uppercase font-bold">
              {project.column?.name || "Project"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="space-y-1">
            <SheetTitle>Project Details</SheetTitle>
            <SheetDescription className="sr-only">
                View and edit project details, tasks, and notes.
            </SheetDescription>
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleUpdate({ title })}
                className="text-2xl font-bold border-none px-0 focus-visible:ring-0 h-auto"
            />
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" /> Priority
              </label>
              <Select
                value={priority}
                onValueChange={(val) => {
                  setPriority(val);
                  handleUpdate({ priority: val });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" /> Due Date
              </label>
              <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start font-normal">
                {project.due_date ? format(new Date(project.due_date), "PPP") : "Set due date"}
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleUpdate({ description })}
              placeholder="Add a more detailed description..."
              className="min-h-[100px] resize-none text-sm"
            />
          </div>

          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center">
                <CheckSquare className="h-4 w-4 mr-2" /> Tasks
              </h3>
              <Badge variant="secondary">
                {project.tasks?.filter((t: any) => t.status === "done").length}/{project.tasks?.length || 0}
              </Badge>
            </div>
            <TaskList projectId={project.id} initialTasks={project.tasks || []} />
          </div>

          <Separator />

          {/* Notes Section */}
          <NoteList projectId={project.id} notes={project.notes || []} />

          {/* Tags Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                <Plus className="h-3 w-3 mr-1" /> Add Tag
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
