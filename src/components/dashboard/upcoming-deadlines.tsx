"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow } from "date-fns";
import { CalendarDays } from "lucide-react";
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

interface UpcomingDeadlinesProps {
  tasks: Task[];
}

export function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProps) {
  const { areaId, status, priority, search } = useFilterStore();

  const filteredTasks = tasks.filter((task) => {
    if (areaId && task.areaId !== areaId) return false;
    if (status.length > 0 && !status.includes(task.status)) return false;
    if (priority.length > 0 && !priority.includes(task.priority)) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // Group by date
  const groupedTasks = filteredTasks.reduce(
    (acc, task) => {
      if (!task.dueDate) return acc;
      const dateKey = format(task.dueDate, "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const sortedDates = Object.keys(groupedTasks).sort();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <p>No upcoming deadlines found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dateObj = new Date(date);
              let label = format(dateObj, "EEEE, MMM d");
              if (isToday(dateObj)) label = "Today";
              if (isTomorrow(dateObj)) label = "Tomorrow";

              return (
                <div key={date}>
                  <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                    {label}
                  </h4>
                  <div className="space-y-2">
                    {groupedTasks[date].map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span
                            className={`h-2 w-2 flex-shrink-0 rounded-full ${
                              task.priority === "urgent"
                                ? "bg-red-500"
                                : task.priority === "high"
                                  ? "bg-orange-500"
                                  : task.priority === "medium"
                                    ? "bg-blue-500"
                                    : "bg-slate-500"
                            }`}
                          />
                          <span className="truncate font-medium">
                            {task.title}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 truncate max-w-[100px]"
                        >
                          {task.projectTitle}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
