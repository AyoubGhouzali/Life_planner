import { describe, it, expect } from "vitest";
import { boardSchema } from "../board";

describe("boardSchema", () => {
  const validBoard = {
    name: "Development",
    areaId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts a valid board", () => {
    const result = boardSchema.safeParse(validBoard);
    expect(result.success).toBe(true);
  });

  it("accepts a board with description", () => {
    const result = boardSchema.safeParse({
      ...validBoard,
      description: "Dev board",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = boardSchema.safeParse({ ...validBoard, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 50 characters", () => {
    const result = boardSchema.safeParse({
      ...validBoard,
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description exceeding 200 characters", () => {
    const result = boardSchema.safeParse({
      ...validBoard,
      description: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid areaId", () => {
    const result = boardSchema.safeParse({
      ...validBoard,
      areaId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});
