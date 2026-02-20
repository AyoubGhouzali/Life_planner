import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockFormData,
  mockSupabaseClient,
  mockUser,
  TEST_UUID,
  TEST_UUID_2,
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
      projects: { findFirst: vi.fn() },
      columns: { findFirst: vi.fn() },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  projects: {},
  columns: {},
  boards: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

import {
  createProject,
  updateProject,
  deleteProject,
  moveProject,
  archiveProject,
} from "../project-actions";
import { db } from "@/lib/db";

describe("project-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("createProject", () => {
    it("creates a project with valid data", async () => {
      const newProject = { id: TEST_UUID, title: "New Project" };
      mockReturning.mockResolvedValue([newProject]);
      (
        db.query.columns.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      const formData = createMockFormData({
        title: "New Project",
        columnId: TEST_UUID,
        priority: "high",
      });

      const result = await createProject(formData);
      expect(result).toEqual(newProject);
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({
        title: "Project",
        columnId: TEST_UUID,
      });

      await expect(createProject(formData)).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateProject", () => {
    it("updates a project", async () => {
      const updated = {
        id: TEST_UUID,
        title: "Updated",
        column_id: TEST_UUID_2,
      };
      mockReturning.mockResolvedValue([updated]);
      (
        db.query.columns.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      const formData = createMockFormData({
        title: "Updated",
        columnId: TEST_UUID_2,
        priority: "low",
      });

      const result = await updateProject(TEST_UUID, formData);
      expect(result).toEqual(updated);
    });
  });

  describe("deleteProject", () => {
    it("deletes a project", async () => {
      const deleted = { id: TEST_UUID, column_id: TEST_UUID_2 };
      mockReturning.mockResolvedValue([deleted]);
      (
        db.query.columns.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      await deleteProject(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("moveProject", () => {
    it("moves a project to a new column", async () => {
      const moved = {
        id: TEST_UUID,
        column_id: TEST_UUID_2,
        position: 0,
      };
      mockReturning.mockResolvedValue([moved]);
      (
        db.query.columns.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      const result = await moveProject(TEST_UUID, TEST_UUID_2, 0);
      expect(result).toEqual(moved);
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(moveProject(TEST_UUID, TEST_UUID_2, 0)).rejects.toThrow(
        "Unauthorized",
      );
    });
  });

  describe("archiveProject", () => {
    it("toggles archive status", async () => {
      const project = { id: TEST_UUID, is_archived: false };
      (
        db.query.projects.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(project);
      const archived = {
        id: TEST_UUID,
        is_archived: true,
        column_id: TEST_UUID_2,
      };
      mockReturning.mockResolvedValue([archived]);
      (
        db.query.columns.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      const result = await archiveProject(TEST_UUID);
      expect(result).toEqual(archived);
    });

    it("throws when project not found", async () => {
      (
        db.query.projects.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      await expect(archiveProject(TEST_UUID)).rejects.toThrow(
        "Project not found",
      );
    });
  });
});
