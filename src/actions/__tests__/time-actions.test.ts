import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockSupabaseClient, mockUser, TEST_UUID } from "./helpers";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("date-fns", () => ({
  differenceInSeconds: vi.fn(() => 3600),
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
      timeEntries: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  timeEntries: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
  isNull: vi.fn((...args: unknown[]) => args),
}));

import {
  startTimer,
  stopTimer,
  getRunningTimer,
  deleteTimeEntry,
} from "../time-actions";
import { db } from "@/lib/db";

describe("time-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("startTimer", () => {
    it("starts a new timer", async () => {
      const newEntry = { id: TEST_UUID, start_time: new Date() };
      (
        db.query.timeEntries.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      mockReturning.mockResolvedValue([newEntry]);

      const result = await startTimer(TEST_UUID);
      expect(result).toEqual(newEntry);
      expect(db.insert).toHaveBeenCalled();
    });

    it("stops existing running timers before starting a new one", async () => {
      const runningTimer = {
        id: "running-timer-id",
        start_time: new Date(),
      };
      (
        db.query.timeEntries.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([runningTimer]);
      (
        db.query.timeEntries.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(runningTimer);

      const newEntry = { id: TEST_UUID, start_time: new Date() };
      mockReturning.mockResolvedValue([newEntry]);

      await startTimer(TEST_UUID);
      // update called for stopping + insert for new timer
      expect(db.update).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(startTimer()).rejects.toThrow("Unauthorized");
    });
  });

  describe("stopTimer", () => {
    it("stops a running timer", async () => {
      const entry = {
        id: TEST_UUID,
        start_time: new Date("2026-02-20T09:00:00Z"),
      };
      (
        db.query.timeEntries.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(entry);
      const stopped = { ...entry, end_time: new Date(), duration: 3600 };
      mockReturning.mockResolvedValue([stopped]);

      const result = await stopTimer(TEST_UUID);
      expect(result).toEqual(stopped);
    });

    it("throws when entry not found", async () => {
      (
        db.query.timeEntries.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      await expect(stopTimer(TEST_UUID)).rejects.toThrow("Entry not found");
    });
  });

  describe("getRunningTimer", () => {
    it("returns a running timer for the user", async () => {
      const timer = { id: TEST_UUID, start_time: new Date() };
      (
        db.query.timeEntries.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(timer);

      const result = await getRunningTimer(mockUser.id);
      expect(result).toEqual(timer);
    });

    it("returns undefined when no running timer", async () => {
      (
        db.query.timeEntries.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);

      const result = await getRunningTimer(mockUser.id);
      expect(result).toBeUndefined();
    });
  });

  describe("deleteTimeEntry", () => {
    it("deletes a time entry", async () => {
      mockWhere.mockResolvedValue(undefined);

      await deleteTimeEntry(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(deleteTimeEntry(TEST_UUID)).rejects.toThrow("Unauthorized");
    });
  });
});
