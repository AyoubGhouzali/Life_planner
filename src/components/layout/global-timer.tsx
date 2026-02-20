"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Timer } from "lucide-react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { stopTimer } from "@/actions/time-actions";
import { toast } from "sonner";
import { formatDuration, intervalToDuration } from "date-fns";

export function GlobalTimer() {
  const { runningTimerId, startTime, projectTitle, clearTimer } =
    useTimerStore();
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = intervalToDuration({ start: startTime, end: now });

      const pad = (n: number | undefined) =>
        (n || 0).toString().padStart(2, "0");
      setElapsed(
        `${pad(duration.hours)}:${pad(duration.minutes)}:${pad(duration.seconds)}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleStop = async () => {
    if (!runningTimerId) return;
    try {
      await stopTimer(runningTimerId);
      clearTimer();
      toast.success("Timer stopped");
    } catch (error) {
      toast.error("Failed to stop timer");
    }
  };

  if (!runningTimerId) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 animate-in fade-in slide-in-from-top-1">
      <div className="flex flex-col items-start leading-none">
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
          Tracking: {projectTitle || "Task"}
        </span>
        <span className="text-sm font-mono font-bold">{elapsed}</span>
      </div>
      <Button
        size="icon"
        variant="destructive"
        className="h-8 w-8 rounded-full"
        onClick={handleStop}
      >
        <Square className="h-4 w-4 fill-current" />
      </Button>
    </div>
  );
}
