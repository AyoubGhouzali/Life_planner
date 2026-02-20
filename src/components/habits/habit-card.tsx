"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CheckSquare, Flame, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { logHabit, unlogHabit } from "@/actions/habit-actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description: string | null;
    frequency: string;
    target_count: number;
    area?: {
      name: string;
      color: string | null;
    } | null;
    isCompletedToday: boolean;
    currentStreak: number;
    bestStreak: number;
  };
}

export function HabitCard({ habit }: HabitCardProps) {
  const [isCompleted, setIsCompleted] = useState(habit.isCompletedToday);
  const [streak, setStreak] = useState(habit.currentStreak);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsCompleted(habit.isCompletedToday);
    setStreak(habit.currentStreak);
  }, [habit.isCompletedToday, habit.currentStreak]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isCompleted) {
        await unlogHabit(habit.id);
        setIsCompleted(false);
        setStreak((prev) => Math.max(0, prev - 1));
        toast.success("Habit log removed");
      } else {
        await logHabit(habit.id);
        setIsCompleted(true);
        setStreak((prev) => prev + 1);
        toast.success("Habit logged! Keep it up!");
      }
    } catch (error) {
      toast.error("Failed to update habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("transition-all", isCompleted && "bg-muted/40")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold">{habit.name}</CardTitle>
          {habit.area && (
            <Badge variant="outline" className="text-[10px] h-5">
              {habit.area.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className={cn("h-4 w-4", streak > 0 && "fill-orange-500")} />
          <span className="text-sm font-bold">{streak}</span>
        </div>
      </CardHeader>
      <CardContent>
        {habit.description && (
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
            {habit.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            {habit.frequency} • Target: {habit.target_count}
          </div>
          <Button
            size="sm"
            variant={isCompleted ? "secondary" : "default"}
            className={cn(
              "h-8 px-3 transition-all",
              isCompleted &&
                "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400",
            )}
            onClick={handleToggle}
            disabled={loading}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Undo
              </>
            ) : (
              <>
                <CheckSquare className="h-3.5 w-3.5 mr-1" />
                Done
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
