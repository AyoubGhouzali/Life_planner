import { describe, it, expect } from "vitest";
import { timeEntrySchema } from "../time";

describe("timeEntrySchema", () => {
  const validEntry = {
    startTime: new Date("2026-02-20T09:00:00Z"),
  };

  it("accepts a valid time entry with startTime only", () => {
    const result = timeEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it("accepts a time entry with all fields", () => {
    const result = timeEntrySchema.safeParse({
      ...validEntry,
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      taskId: "550e8400-e29b-41d4-a716-446655440001",
      endTime: new Date("2026-02-20T10:00:00Z"),
      description: "Working on feature",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable projectId", () => {
    const result = timeEntrySchema.safeParse({
      ...validEntry,
      projectId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable taskId", () => {
    const result = timeEntrySchema.safeParse({
      ...validEntry,
      taskId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable endTime", () => {
    const result = timeEntrySchema.safeParse({
      ...validEntry,
      endTime: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable description", () => {
    const result = timeEntrySchema.safeParse({
      ...validEntry,
      description: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing startTime", () => {
    const result = timeEntrySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid startTime type", () => {
    const result = timeEntrySchema.safeParse({
      startTime: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});
