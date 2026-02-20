import { describe, it, expect } from "vitest";
import { projectSchema } from "../project";

describe("projectSchema", () => {
  const validProject = {
    title: "My Project",
    columnId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts a valid project with required fields", () => {
    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("accepts a project with all fields", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      description: "A description",
      priority: "high",
      dueDate: "2026-06-01T00:00:00.000Z",
      isProcess: true,
      tags: ["frontend", "urgent"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = projectSchema.safeParse({ ...validProject, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding 100 characters", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      title: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description exceeding 500 characters", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      description: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid columnId", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      columnId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("defaults priority to medium", () => {
    const result = projectSchema.parse(validProject);
    expect(result.priority).toBe("medium");
  });

  it("defaults isProcess to false", () => {
    const result = projectSchema.parse(validProject);
    expect(result.isProcess).toBe(false);
  });

  it("defaults tags to empty array", () => {
    const result = projectSchema.parse(validProject);
    expect(result.tags).toEqual([]);
  });

  it("rejects invalid priority value", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      priority: "critical",
    });
    expect(result.success).toBe(false);
  });
});
