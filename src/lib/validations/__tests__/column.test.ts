import { describe, it, expect } from "vitest";
import { columnSchema } from "../column";

describe("columnSchema", () => {
  const validColumn = {
    name: "To Do",
    boardId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts a valid column", () => {
    const result = columnSchema.safeParse(validColumn);
    expect(result.success).toBe(true);
  });

  it("accepts a column with all optional fields", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      color: "#FF0000",
      wipLimit: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = columnSchema.safeParse({ ...validColumn, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 50 characters", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid boardId", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      boardId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hex color", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      color: "blue",
    });
    expect(result.success).toBe(false);
  });

  it("accepts nullable color", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      color: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable wipLimit", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      wipLimit: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative wipLimit", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      wipLimit: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts wipLimit of 0", () => {
    const result = columnSchema.safeParse({
      ...validColumn,
      wipLimit: 0,
    });
    expect(result.success).toBe(true);
  });
});
