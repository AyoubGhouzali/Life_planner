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
      habitLogs: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  habits: {},
  habitLogs: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
  gte: vi.fn((...args: unknown[]) => args),
  lte: vi.fn((...args: unknown[]) => args),
}));

vi.mock("date-fns", () => ({
  startOfDay: vi.fn((d: Date) => d),
  endOfDay: vi.fn((d: Date) => d),
}));

import {
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  unlogHabit,
} from "../habit-actions";
import { db } from "@/lib/db";

describe("habit-actions", () => {
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

  describe("createHabit", () => {
    it("creates a habit with valid data", async () => {
      const newHabit = { id: TEST_UUID, name: "Exercise" };
      mockReturning.mockResolvedValue([newHabit]);

      const formData = createMockFormData({
        name: "Exercise",
        description: "Daily workout",
        frequency: "daily",
        targetCount: "1",
      });

      const result = await createHabit(formData);
      expect(result).toEqual(newHabit);
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({
        name: "Exercise",
        frequency: "daily",
        targetCount: "1",
      });

      await expect(createHabit(formData)).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateHabit", () => {
    it("updates a habit", async () => {
      const updated = { id: TEST_UUID, name: "Morning Run" };
      mockReturning.mockResolvedValue([updated]);

      const formData = createMockFormData({
        name: "Morning Run",
        description: "Run every morning",
        frequency: "daily",
        targetCount: "1",
      });

      const result = await updateHabit(TEST_UUID, formData);
      expect(result).toEqual(updated);
    });
  });

  describe("deleteHabit", () => {
    it("deletes a habit", async () => {
      mockWhere.mockResolvedValue(undefined as any);

      await deleteHabit(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("logHabit", () => {
    it("creates a new log when none exists for today", async () => {
      (
        db.query.habitLogs.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      mockValues.mockReturnValue({ returning: mockReturning });

      await logHabit(TEST_UUID);
      expect(db.insert).toHaveBeenCalled();
    });

    it("increments value when log already exists", async () => {
      const existing = { id: "log-1", value: 1 };
      (
        db.query.habitLogs.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(existing);
      mockWhere.mockResolvedValue(undefined as any);

      await logHabit(TEST_UUID);
      expect(db.update).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(logHabit(TEST_UUID)).rejects.toThrow("Unauthorized");
    });
  });

  describe("unlogHabit", () => {
    it("deletes habit log for the day", async () => {
      mockWhere.mockResolvedValue(undefined as any);

      await unlogHabit(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(unlogHabit(TEST_UUID)).rejects.toThrow("Unauthorized");
    });
  });
});
