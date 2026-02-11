"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ProjectDetail } from "./project-detail";
import { useState } from "react";

interface ProjectCardProps {
  project: any;
  isOverlay?: boolean;
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function ProjectCard({ project, isOverlay }: ProjectCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: {
      type: "Project",
      project,
    },
    disabled: isOverlay,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-muted border-2 border-dashed border-primary/20 rounded-lg h-[120px] w-full"
      />
    );
  }

  const completedTasks = project.tasks?.filter((t: any) => t.status === "done").length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const isOverdue = project.due_date && new Date(project.due_date) < new Date() && project.column?.name !== "Done";

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isOverlay && setShowDetail(true)}
        className={cn(
          "group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all shadow-sm",
          isOverlay && "cursor-grabbing shadow-xl ring-2 ring-primary border-primary",
          isOverdue && "border-destructive/50"
        )}
      >
        <CardContent className="p-3 space-y-3">
          {/* Priority & Tags */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={cn("text-[10px] uppercase font-bold py-0 h-5", priorityColors[project.priority as keyof typeof priorityColors])}
            >
              {project.priority}
            </Badge>
            {project.due_date && (
              <div className={cn(
                "flex items-center text-[10px] font-medium",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}>
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(project.due_date), "MMM d")}
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
            {project.title}
          </h4>

          {/* Progress & Stats */}
          {totalTasks > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <div className="flex items-center">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  {completedTasks}/{totalTasks}
                </div>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectDetail 
        project={project} 
        open={showDetail} 
        onOpenChange={setShowDetail} 
      />
    </>
  );
}
