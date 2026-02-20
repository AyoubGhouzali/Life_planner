import { describe, it, expect } from "vitest";
import { habitSchema, habitLogSchema } from "../habit";

describe("habitSchema", () => {
  const validHabit = {
    name: "Exercise",
    frequency: "daily" as const,
    targetCount: 1,
  };

  it("accepts a valid habit with required fields", () => {
    const result = habitSchema.safeParse(validHabit);
    expect(result.success).toBe(true);
  });

  it("accepts a habit with all optional fields", () => {
    const result = habitSchema.safeParse({
      ...validHabit,
      description: "30 minutes of exercise",
      areaId: "550e8400-e29b-41d4-a716-446655440000",
      frequencyConfig: { days: ["mon", "wed", "fri"] },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = habitSchema.safeParse({ ...validHabit, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid frequency", () => {
    const result = habitSchema.safeParse({
      ...validHabit,
      frequency: "monthly",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid frequencies", () => {
    for (const frequency of ["daily", "weekly", "custom"]) {
      const result = habitSchema.safeParse({ ...validHabit, frequency });
      expect(result.success).toBe(true);
    }
  });

  it("rejects targetCount less than 1", () => {
    const result = habitSchema.safeParse({
      ...validHabit,
      targetCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts nullable areaId", () => {
    const result = habitSchema.safeParse({ ...validHabit, areaId: null });
    expect(result.success).toBe(true);
  });
});

describe("habitLogSchema", () => {
  const validLog = {
    habitId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts a valid habit log with required fields", () => {
    const result = habitLogSchema.safeParse(validLog);
    expect(result.success).toBe(true);
  });

  it("accepts a log with all optional fields", () => {
    const result = habitLogSchema.safeParse({
      ...validLog,
      completedAt: new Date(),
      value: 2,
      note: "Great workout",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid habitId", () => {
    const result = habitLogSchema.safeParse({
      ...validLog,
      habitId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects value less than 1", () => {
    const result = habitLogSchema.safeParse({ ...validLog, value: 0 });
    expect(result.success).toBe(false);
  });

  it("defaults value to 1", () => {
    const result = habitLogSchema.parse(validLog);
    expect(result.value).toBe(1);
  });
});
