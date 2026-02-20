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

const mockReturning = vi.fn<any>();
const mockWhere = vi.fn<any>(() => ({ returning: mockReturning }));
const mockSet = vi.fn<any>(() => ({ where: mockWhere }));
const mockValues = vi.fn<any>(() => ({ returning: mockReturning }));

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({ values: mockValues })),
    update: vi.fn(() => ({ set: mockSet })),
    delete: vi.fn(() => ({ where: mockWhere })),
    query: {
      lifeAreas: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  lifeAreas: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

import {
  createArea,
  updateArea,
  deleteArea,
  archiveArea,
  reorderAreas,
} from "../area-actions";
import { db } from "@/lib/db";

describe("area-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("createArea", () => {
    it("creates an area with valid data", async () => {
      const newArea = { id: TEST_UUID, name: "Health" };
      mockReturning.mockResolvedValue([newArea]);

      const formData = createMockFormData({
        name: "Health",
        icon: "heart",
        color: "#FF0000",
        description: "Health tracking",
      });

      const result = await createArea(formData);
      expect(result).toEqual(newArea);
      expect(db.insert).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({ name: "Health" });
      await expect(createArea(formData)).rejects.toThrow("Unauthorized");
    });

    it("throws on invalid data (empty name)", async () => {
      const formData = createMockFormData({ name: "" });
      await expect(createArea(formData)).rejects.toThrow();
    });
  });

  describe("updateArea", () => {
    it("updates an area", async () => {
      const updated = { id: TEST_UUID, name: "Fitness" };
      mockReturning.mockResolvedValue([updated]);

      const formData = createMockFormData({
        name: "Fitness",
        icon: "dumbbell",
        color: "#00FF00",
        description: "Fitness tracking",
      });

      const result = await updateArea(TEST_UUID, formData);
      expect(result).toEqual(updated);
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({ name: "Work" });
      await expect(updateArea(TEST_UUID, formData)).rejects.toThrow(
        "Unauthorized",
      );
    });
  });

  describe("deleteArea", () => {
    it("deletes an area", async () => {
      mockWhere.mockResolvedValue(undefined);

      await deleteArea(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(deleteArea(TEST_UUID)).rejects.toThrow("Unauthorized");
    });
  });

  describe("archiveArea", () => {
    it("toggles archive status", async () => {
      const area = { id: TEST_UUID, is_archived: false };
      (db.query.lifeAreas.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(area);
      mockWhere.mockResolvedValue(undefined);

      await archiveArea(TEST_UUID);
      expect(db.update).toHaveBeenCalled();
    });

    it("throws when area not found", async () => {
      (db.query.lifeAreas.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(archiveArea(TEST_UUID)).rejects.toThrow("Area not found");
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(archiveArea(TEST_UUID)).rejects.toThrow("Unauthorized");
    });
  });

  describe("reorderAreas", () => {
    it("reorders areas", async () => {
      mockWhere.mockResolvedValue(undefined);

      await reorderAreas([TEST_UUID]);
      expect(db.update).toHaveBeenCalled();
    });
  });
});
