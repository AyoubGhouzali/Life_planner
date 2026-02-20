import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockFormData,
  mockSupabaseClient,
  mockUser,
  TEST_UUID,
} from "./helpers";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockReturning = vi.fn();
const mockWhere = vi.fn(() => ({ returning: mockReturning }));
const mockSet = vi.fn(() => ({ where: mockWhere }));
const mockValues = vi.fn(() => ({ returning: mockReturning }));

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({ values: mockValues })),
    update: vi.fn(() => ({ set: mockSet })),
    delete: vi.fn(() => ({ where: mockWhere })),
    query: {
      notes: { findFirst: vi.fn() },
      projects: { findFirst: vi.fn() },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  notes: {},
  projects: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
  desc: vi.fn((...args: unknown[]) => args),
}));

import {
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} from "../note-actions";
import { db } from "@/lib/db";

describe("note-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });
    // Re-establish mock chains after clearAllMocks
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockSet.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ returning: mockReturning });
  });

  describe("createNote", () => {
    it("creates a note with valid data", async () => {
      const newNote = { id: TEST_UUID, title: "Meeting Notes" };
      mockReturning.mockResolvedValue([newNote]);
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const formData = createMockFormData({
        projectId: TEST_UUID,
        title: "Meeting Notes",
        content: "Discussed roadmap",
      });

      const result = await createNote(formData);
      expect(result).toEqual(newNote);
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({
        projectId: TEST_UUID,
        title: "Note",
      });

      await expect(createNote(formData)).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateNote", () => {
    it("updates a note", async () => {
      const updated = { id: TEST_UUID, title: "Updated Note", project_id: TEST_UUID };
      mockReturning.mockResolvedValue([updated]);
      (db.query.notes.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const formData = createMockFormData({
        title: "Updated Note",
        content: "New content",
      });

      const result = await updateNote(TEST_UUID, formData);
      expect(result).toEqual(updated);
    });

    it("throws when title is empty", async () => {
      const formData = createMockFormData({ title: "", content: "Content" });
      await expect(updateNote(TEST_UUID, formData)).rejects.toThrow(
        "Title required",
      );
    });
  });

  describe("deleteNote", () => {
    it("deletes a note", async () => {
      (db.query.notes.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      mockWhere.mockResolvedValue(undefined);

      await deleteNote(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("togglePinNote", () => {
    it("toggles pin status", async () => {
      const note = { id: TEST_UUID, is_pinned: false };
      (db.query.notes.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(note);
      const toggled = {
        id: TEST_UUID,
        is_pinned: true,
        project_id: TEST_UUID,
      };
      mockReturning.mockResolvedValue([toggled]);
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await togglePinNote(TEST_UUID);
      expect(result).toEqual(toggled);
    });

    it("throws when note not found", async () => {
      (db.query.notes.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(togglePinNote(TEST_UUID)).rejects.toThrow("Note not found");
    });
  });
});
