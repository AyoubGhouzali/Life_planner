import { describe, it, expect } from "vitest";
import { goalSchema } from "../goal";

describe("goalSchema", () => {
  it("accepts a valid goal with title only", () => {
    const result = goalSchema.safeParse({ title: "Learn TypeScript" });
    expect(result.success).toBe(true);
  });

  it("accepts a goal with all optional fields", () => {
    const result = goalSchema.safeParse({
      title: "Run a marathon",
      description: "Complete a full marathon",
      targetDate: "2026-12-31",
      targetValue: 42,
      unit: "km",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = goalSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("accepts nullable targetDate", () => {
    const result = goalSchema.safeParse({
      title: "Goal",
      targetDate: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable targetValue", () => {
    const result = goalSchema.safeParse({
      title: "Goal",
      targetValue: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable unit", () => {
    const result = goalSchema.safeParse({ title: "Goal", unit: null });
    expect(result.success).toBe(true);
  });
});
