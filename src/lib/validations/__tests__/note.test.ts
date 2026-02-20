import { describe, it, expect } from "vitest";
import { noteSchema } from "../note";

describe("noteSchema", () => {
  const validNote = {
    projectId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Meeting Notes",
  };

  it("accepts a valid note", () => {
    const result = noteSchema.safeParse(validNote);
    expect(result.success).toBe(true);
  });

  it("accepts a note with content", () => {
    const result = noteSchema.safeParse({
      ...validNote,
      content: "Discussed project timeline",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid projectId", () => {
    const result = noteSchema.safeParse({
      ...validNote,
      projectId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = noteSchema.safeParse({ ...validNote, title: "" });
    expect(result.success).toBe(false);
  });

  it("accepts note without content", () => {
    const result = noteSchema.safeParse(validNote);
    expect(result.success).toBe(true);
  });
});
