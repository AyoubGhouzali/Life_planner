"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Target, Calendar, FolderOpen } from "lucide-react";
import Link from "next/link";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string | null;
    target_date: Date | null;
    progress: number;
    completedTasks: number;
    totalTasks: number;
    goalProjects: any[];
  };
}

export function GoalCard({ goal }: GoalCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {goal.title}
            </CardTitle>
            {goal.target_date && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {format(new Date(goal.target_date), "PPP")}
              </p>
            )}
          </div>
          <Badge variant={goal.progress === 100 ? "default" : "secondary"}>
            {goal.progress}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {goal.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Overall Progress</span>
            <span>
              {goal.completedTasks} / {goal.totalTasks} tasks
            </span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <FolderOpen className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {goal.goalProjects.length} linked projects
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
