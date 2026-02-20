import { describe, it, expect } from "vitest";
import { taskSchema } from "../task";

describe("taskSchema", () => {
  const validTask = {
    title: "My Task",
    projectId: "550e8400-e29b-41d4-a716-446655440000",
    status: "todo" as const,
    priority: "medium" as const,
  };

  it("accepts a valid task with required fields", () => {
    const result = taskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("accepts a task with all optional fields", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      parentTaskId: "550e8400-e29b-41d4-a716-446655440001",
      dueDate: "2026-03-01T00:00:00.000Z",
      isRecurring: true,
      recurrenceRule: "daily",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = taskSchema.safeParse({ ...validTask, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding 200 characters", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid projectId (non-uuid)", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      projectId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["todo", "in_progress", "done"]) {
      const result = taskSchema.safeParse({ ...validTask, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid priority", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      priority: "critical",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid priorities", () => {
    for (const priority of ["low", "medium", "high", "urgent"]) {
      const result = taskSchema.safeParse({ ...validTask, priority });
      expect(result.success).toBe(true);
    }
  });

  it("defaults status to todo", () => {
    const { status, ...withoutStatus } = validTask;
    const result = taskSchema.parse(withoutStatus);
    expect(result.status).toBe("todo");
  });

  it("defaults priority to medium", () => {
    const { priority, ...withoutPriority } = validTask;
    const result = taskSchema.parse(withoutPriority);
    expect(result.priority).toBe("medium");
  });

  it("defaults isRecurring to false", () => {
    const result = taskSchema.parse(validTask);
    expect(result.isRecurring).toBe(false);
  });

  it("accepts nullable parentTaskId", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      parentTaskId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable dueDate", () => {
    const result = taskSchema.safeParse({ ...validTask, dueDate: null });
    expect(result.success).toBe(true);
  });

  it("rejects invalid dueDate format", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      dueDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});
