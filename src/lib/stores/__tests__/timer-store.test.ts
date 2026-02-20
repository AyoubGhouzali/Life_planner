import { describe, it, expect, beforeEach } from "vitest";
import { useTimerStore } from "../timer-store";

describe("useTimerStore", () => {
  beforeEach(() => {
    useTimerStore.setState({
      runningTimerId: null,
      startTime: null,
      projectTitle: null,
    });
  });

  it("has correct initial state", () => {
    const state = useTimerStore.getState();
    expect(state.runningTimerId).toBeNull();
    expect(state.startTime).toBeNull();
    expect(state.projectTitle).toBeNull();
  });

  it("sets timer with all values", () => {
    const now = new Date();
    useTimerStore.getState().setTimer("timer-1", now, "My Project");

    const state = useTimerStore.getState();
    expect(state.runningTimerId).toBe("timer-1");
    expect(state.startTime).toBe(now);
    expect(state.projectTitle).toBe("My Project");
  });

  it("sets timer with null values", () => {
    useTimerStore.getState().setTimer(null, null, null);

    const state = useTimerStore.getState();
    expect(state.runningTimerId).toBeNull();
    expect(state.startTime).toBeNull();
    expect(state.projectTitle).toBeNull();
  });

  it("clears timer", () => {
    const now = new Date();
    useTimerStore.getState().setTimer("timer-1", now, "My Project");
    useTimerStore.getState().clearTimer();

    const state = useTimerStore.getState();
    expect(state.runningTimerId).toBeNull();
    expect(state.startTime).toBeNull();
    expect(state.projectTitle).toBeNull();
  });

  it("overwrites existing timer", () => {
    const time1 = new Date("2026-01-01");
    const time2 = new Date("2026-02-01");

    useTimerStore.getState().setTimer("timer-1", time1, "Project A");
    useTimerStore.getState().setTimer("timer-2", time2, "Project B");

    const state = useTimerStore.getState();
    expect(state.runningTimerId).toBe("timer-2");
    expect(state.startTime).toBe(time2);
    expect(state.projectTitle).toBe("Project B");
  });
});
