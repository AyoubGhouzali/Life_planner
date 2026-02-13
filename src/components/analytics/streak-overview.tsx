"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface StreakOverviewProps {
  data: { id: string; name: string; completionCount: number }[];
}

export function StreakOverview({ data }: StreakOverviewProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Habit Performance (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{habit.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{habit.completionCount} completions</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-orange-500 text-orange-500" />
                  {habit.completionCount >= 20 ? "Strong" : habit.completionCount >= 10 ? "Good" : "Starting"}
                </Badge>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No habits tracked in this period.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
