"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";

interface TimerInitializerProps {
  timer: any;
}

export function TimerInitializer({ timer }: TimerInitializerProps) {
  const setTimer = useTimerStore((state) => state.setTimer);

  useEffect(() => {
    if (timer) {
      setTimer(
        timer.id,
        new Date(timer.start_time),
        timer.project?.title || null,
      );
    }
  }, [timer, setTimer]);

  return null;
}
