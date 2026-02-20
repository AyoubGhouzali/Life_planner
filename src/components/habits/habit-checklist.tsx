"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { logHabit, unlogHabit } from "@/actions/habit-actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface Habit {
  id: string;
  name: string;
  isCompletedToday: boolean;
  currentStreak: number;
}

interface HabitChecklistProps {
  habits: Habit[];
}

export function HabitChecklist({ habits }: HabitChecklistProps) {
  const [localHabits, setLocalHabits] = useState(habits);

  useEffect(() => {
    setLocalHabits(habits);
  }, [habits]);

  const handleToggle = async (habitId: string, isCompleted: boolean) => {
    // Optimistic update
    setLocalHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            isCompletedToday: !isCompleted,
            currentStreak: !isCompleted
              ? h.currentStreak + 1
              : Math.max(0, h.currentStreak - 1),
          };
        }
        return h;
      }),
    );

    try {
      if (isCompleted) {
        await unlogHabit(habitId);
      } else {
        await logHabit(habitId);
      }
    } catch (error) {
      toast.error("Failed to update habit");
      // Revert optimistic update on error
      setLocalHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              isCompletedToday: isCompleted,
              currentStreak: isCompleted
                ? h.currentStreak + 1
                : Math.max(0, h.currentStreak - 1),
            };
          }
          return h;
        }),
      );
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Today's Habits
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        {localHabits.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No habits for today
          </div>
        ) : (
          <div className="space-y-1">
            {localHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleToggle(habit.id, habit.isCompletedToday)
                    }
                    className="focus:outline-none"
                  >
                    {habit.isCompletedToday ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      habit.isCompletedToday &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {habit.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                  <Flame className="h-3 w-3" />
                  {habit.currentStreak}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
