import { describe, it, expect } from "vitest";
import { areaSchema } from "../area";

describe("areaSchema", () => {
  it("accepts a valid area with name only", () => {
    const result = areaSchema.safeParse({ name: "Work" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid area with all fields", () => {
    const result = areaSchema.safeParse({
      name: "Health",
      icon: "heart",
      color: "#FF5733",
      description: "Track health goals",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = areaSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 50 characters", () => {
    const result = areaSchema.safeParse({ name: "a".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 50 characters", () => {
    const result = areaSchema.safeParse({ name: "a".repeat(50) });
    expect(result.success).toBe(true);
  });

  it("rejects invalid hex color format", () => {
    const result = areaSchema.safeParse({ name: "Work", color: "red" });
    expect(result.success).toBe(false);
  });

  it("accepts valid 3-digit hex color", () => {
    const result = areaSchema.safeParse({ name: "Work", color: "#F00" });
    expect(result.success).toBe(true);
  });

  it("accepts valid 6-digit hex color", () => {
    const result = areaSchema.safeParse({ name: "Work", color: "#FF0000" });
    expect(result.success).toBe(true);
  });

  it("rejects description exceeding 200 characters", () => {
    const result = areaSchema.safeParse({
      name: "Work",
      description: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
