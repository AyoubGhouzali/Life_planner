"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, GripVertical, Trash2, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { toggleTask, deleteTask, createTask } from "@/actions/task-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TaskItemProps {
  task: any;
  isSubtask?: boolean;
}

export function TaskItem({ task, isSubtask }: TaskItemProps) {
  const [isPending, setIsPending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  async function handleToggle() {
    setIsPending(true);
    try {
      await toggleTask(task.id);
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    setIsPending(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setIsPending(false);
    }
  }

  async function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("title", subtaskTitle);
      formData.append("projectId", task.project_id);
      formData.append("parentTaskId", task.id);
      formData.append("status", "todo");
      formData.append("priority", "medium");

      await createTask(formData);
      setSubtaskTitle("");
      setIsAddingSubtask(false);
      setIsExpanded(true);
      toast.success("Subtask added");
    } catch (error) {
      toast.error("Failed to add subtask");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group",
          isDragging && "opacity-50 bg-muted",
          isSubtask && "ml-6"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {!isSubtask && task.subtasks?.length > 0 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        
        {!isSubtask && task.subtasks?.length === 0 && (
          <div className="w-4" />
        )}
        
        <Checkbox 
          checked={task.status === "done"} 
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
        
        <span className={cn(
          "flex-1 text-sm transition-all",
          task.status === "done" && "line-through text-muted-foreground"
        )}>
          {task.title}
        </span>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          {!isSubtask && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsAddingSubtask(true)}
              disabled={isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {isAddingSubtask && (
        <form onSubmit={handleAddSubtask} className="ml-12 pr-2">
          <Input
            autoFocus
            placeholder="Add subtask..."
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            className="h-8 text-xs"
            disabled={isPending}
            onBlur={() => !subtaskTitle && setIsAddingSubtask(false)}
          />
        </form>
      )}

      {!isSubtask && isExpanded && task.subtasks?.length > 0 && (
        <div className="space-y-1">
          {task.subtasks.map((subtask: any) => (
            <TaskItem key={subtask.id} task={subtask} isSubtask />
          ))}
        </div>
      )}
    </div>
  );
}