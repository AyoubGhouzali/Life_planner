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

const mockOnConflictDoNothing = vi.fn<any>();
const mockReturning = vi.fn<any>();
const mockWhere = vi.fn<any>(() => ({ returning: mockReturning }));
const mockSet = vi.fn<any>(() => ({ where: mockWhere }));
const mockValues = vi.fn<any>(() => ({
  returning: mockReturning,
  onConflictDoNothing: mockOnConflictDoNothing,
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({ values: mockValues })),
    update: vi.fn(() => ({ set: mockSet })),
    delete: vi.fn(() => ({ where: mockWhere })),
    query: {
      goals: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  goals: {},
  goalProjects: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

import {
  createGoal,
  updateGoal,
  deleteGoal,
  linkProjectToGoal,
  unlinkProjectFromGoal,
} from "../goal-actions";
import { db } from "@/lib/db";

describe("goal-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });
    // Re-establish mock chains after clearAllMocks
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockSet.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({
      returning: mockReturning,
      onConflictDoNothing: mockOnConflictDoNothing,
    });
  });

  describe("createGoal", () => {
    it("creates a goal with valid data", async () => {
      const newGoal = { id: TEST_UUID, title: "Learn TypeScript" };
      mockReturning.mockResolvedValue([newGoal]);

      const formData = createMockFormData({
        title: "Learn TypeScript",
        description: "Master TS",
        targetValue: "100",
        unit: "hours",
      });

      const result = await createGoal(formData);
      expect(result).toEqual(newGoal);
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({ title: "Goal" });
      await expect(createGoal(formData)).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateGoal", () => {
    it("updates a goal", async () => {
      const updated = { id: TEST_UUID, title: "Updated Goal" };
      mockReturning.mockResolvedValue([updated]);

      const formData = createMockFormData({
        title: "Updated Goal",
        description: "Updated description",
        targetValue: "50",
      });

      const result = await updateGoal(TEST_UUID, formData);
      expect(result).toEqual(updated);
    });

    it("throws when goal not found", async () => {
      mockReturning.mockResolvedValue([undefined]);

      const formData = createMockFormData({ title: "Updated", description: "Desc" });
      await expect(updateGoal(TEST_UUID, formData)).rejects.toThrow(
        "Goal not found",
      );
    });
  });

  describe("deleteGoal", () => {
    it("deletes a goal", async () => {
      mockWhere.mockResolvedValue(undefined);

      await deleteGoal(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("linkProjectToGoal", () => {
    it("links a project to a goal", async () => {
      const goal = { id: TEST_UUID, user_id: mockUser.id };
      (db.query.goals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(goal);
      mockOnConflictDoNothing.mockResolvedValue(undefined);

      await linkProjectToGoal(TEST_UUID, TEST_UUID_2);
      expect(db.insert).toHaveBeenCalled();
    });

    it("throws when goal not found", async () => {
      (db.query.goals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        linkProjectToGoal(TEST_UUID, TEST_UUID_2),
      ).rejects.toThrow("Goal not found");
    });
  });

  describe("unlinkProjectFromGoal", () => {
    it("unlinks a project from a goal", async () => {
      const goal = { id: TEST_UUID, user_id: mockUser.id };
      (db.query.goals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(goal);
      mockWhere.mockResolvedValue(undefined);

      await unlinkProjectFromGoal(TEST_UUID, TEST_UUID_2);
      expect(db.delete).toHaveBeenCalled();
    });

    it("throws when goal not found", async () => {
      (db.query.goals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        unlinkProjectFromGoal(TEST_UUID, TEST_UUID_2),
      ).rejects.toThrow("Goal not found");
    });
  });
});
