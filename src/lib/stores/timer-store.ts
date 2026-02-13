import { create } from 'zustand';

interface TimerState {
  runningTimerId: string | null;
  startTime: Date | null;
  projectTitle: string | null;
  setTimer: (id: string | null, start: Date | null, title: string | null) => void;
  clearTimer: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  runningTimerId: null,
  startTime: null,
  projectTitle: null,
  setTimer: (id, start, title) => set({ runningTimerId: id, startTime: start, projectTitle: title }),
  clearTimer: () => set({ runningTimerId: null, startTime: null, projectTitle: null }),
}));
