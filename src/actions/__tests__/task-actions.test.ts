import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockFormData,
  mockSupabaseClient,
  mockUser,
  TEST_UUID,
  TEST_UUID_2,
} from "./helpers";

// Mock dependencies
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
      tasks: {
        findFirst: vi.fn(),
      },
      projects: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  tasks: {},
  projects: {},
  columns: {},
  boards: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

import {
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  reorderTasks,
} from "../task-actions";
import { db } from "@/lib/db";

describe("task-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("createTask", () => {
    it("creates a task with valid data", async () => {
      const newTask = { id: TEST_UUID, title: "New Task", status: "todo" };
      mockReturning.mockResolvedValue([newTask]);
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const formData = createMockFormData({
        title: "New Task",
        projectId: TEST_UUID,
        status: "todo",
        priority: "medium",
      });

      const result = await createTask(formData);
      expect(result).toEqual(newTask);
      expect(db.insert).toHaveBeenCalled();
    });

    it("throws when user is unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({
        title: "New Task",
        projectId: TEST_UUID,
        status: "todo",
        priority: "medium",
      });

      await expect(createTask(formData)).rejects.toThrow("Unauthorized");
    });

    it("throws on invalid data (empty title)", async () => {
      const formData = createMockFormData({
        title: "",
        projectId: TEST_UUID,
        status: "todo",
        priority: "medium",
      });

      await expect(createTask(formData)).rejects.toThrow();
    });
  });

  describe("updateTask", () => {
    it("updates a task with valid data", async () => {
      const updated = { id: TEST_UUID, title: "Updated", project_id: TEST_UUID_2 };
      mockReturning.mockResolvedValue([updated]);
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const formData = createMockFormData({
        title: "Updated",
        projectId: TEST_UUID,
        status: "in_progress",
        priority: "high",
      });

      const result = await updateTask(TEST_UUID, formData);
      expect(result).toEqual(updated);
      expect(db.update).toHaveBeenCalled();
    });

    it("throws when user is unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({
        title: "Updated",
        projectId: TEST_UUID,
        status: "done",
        priority: "low",
      });

      await expect(updateTask(TEST_UUID, formData)).rejects.toThrow(
        "Unauthorized",
      );
    });
  });

  describe("toggleTask", () => {
    it("toggles a todo task to done", async () => {
      const task = {
        id: TEST_UUID,
        status: "todo",
        is_recurring: false,
        project_id: TEST_UUID_2,
      };
      const toggledTask = { ...task, status: "done", project_id: TEST_UUID_2 };
      (db.query.tasks.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(task);
      mockReturning.mockResolvedValue([toggledTask]);
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await toggleTask(TEST_UUID);
      expect(result).toEqual(toggledTask);
    });

    it("toggles a done task back to todo", async () => {
      const task = {
        id: TEST_UUID,
        status: "done",
        is_recurring: false,
        project_id: TEST_UUID_2,
      };
      const toggledTask = { ...task, status: "todo", project_id: TEST_UUID_2 };
      (db.query.tasks.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(task);
      mockReturning.mockResolvedValue([toggledTask]);
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await toggleTask(TEST_UUID);
      expect(result).toEqual(toggledTask);
    });

    it("throws when task not found", async () => {
      (db.query.tasks.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(toggleTask(TEST_UUID)).rejects.toThrow("Task not found");
    });

    it("creates next recurring task when completing a recurring task", async () => {
      const task = {
        id: TEST_UUID,
        status: "todo",
        is_recurring: true,
        recurrence_rule: "daily",
        due_date: new Date("2026-02-20"),
        project_id: TEST_UUID_2,
        parent_task_id: null,
        title: "Daily standup",
        priority: "medium",
        position: 0,
      };
      const toggledTask = { ...task, status: "done", project_id: TEST_UUID_2 };
      (db.query.tasks.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(task);
      mockReturning.mockResolvedValue([toggledTask]);
      mockValues.mockReturnValue({ returning: mockReturning });
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await toggleTask(TEST_UUID);

      // Should have been called for the insert of the new recurring task
      expect(db.insert).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(toggleTask(TEST_UUID)).rejects.toThrow("Unauthorized");
    });
  });

  describe("deleteTask", () => {
    it("deletes a task", async () => {
      const deletedTask = { id: TEST_UUID, project_id: TEST_UUID_2 };
      mockReturning.mockResolvedValue([deletedTask]);
      (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await deleteTask(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(deleteTask(TEST_UUID)).rejects.toThrow("Unauthorized");
    });
  });

  describe("reorderTasks", () => {
    it("reorders tasks by updating positions", async () => {
      mockWhere.mockResolvedValue(undefined);
      (db.query.tasks.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await reorderTasks([TEST_UUID, TEST_UUID_2]);
      expect(db.update).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(reorderTasks([TEST_UUID])).rejects.toThrow("Unauthorized");
    });
  });
});
