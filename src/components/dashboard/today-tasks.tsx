"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleTask } from "@/actions/task-actions";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { useFilterStore } from "@/lib/stores/filter-store";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: Date | null;
  projectId: string;
  projectTitle: string;
  areaId: string;
  areaName: string;
  areaColor: string | null;
}

interface TodayTasksProps {
  tasks: Task[];
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const { areaId, status, priority, search } = useFilterStore();

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const filteredTasks = localTasks.filter((task) => {
    if (areaId && task.areaId !== areaId) return false;
    if (status.length > 0 && !status.includes(task.status)) return false;
    if (priority.length > 0 && !priority.includes(task.priority)) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleToggle = async (taskId: string) => {
    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t,
      ),
    );

    try {
      await toggleTask(taskId);
    } catch (error) {
      toast.error("Failed to update task");
      // Revert on error
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: t.status === "done" ? "todo" : "done" }
            : t,
        ),
      );
    }
  };

  const priorityColors = {
    low: "bg-slate-500",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Today's Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <p>No tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg border p-3 shadow-sm transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => handleToggle(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <p
                    className={cn(
                      "font-medium leading-none",
                      task.status === "done" &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        priorityColors[task.priority],
                      )}
                    />
                    <span>{task.projectTitle}</span>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {task.areaName}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
