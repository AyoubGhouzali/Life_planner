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
      boards: { findFirst: vi.fn() },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  boards: {},
  columns: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

import { createBoard, updateBoard, deleteBoard } from "../board-actions";
import { db } from "@/lib/db";

describe("board-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("createBoard", () => {
    it("creates a board with default columns", async () => {
      const newBoard = { id: TEST_UUID, name: "Dev Board" };
      mockReturning.mockResolvedValue([newBoard]);
      // For columns insert
      mockValues.mockReturnValue({ returning: mockReturning });

      const formData = createMockFormData({
        name: "Dev Board",
        description: "Development",
        areaId: TEST_UUID,
      });

      const result = await createBoard(formData);
      expect(result).toEqual(newBoard);
      // insert is called for both board and default columns
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("throws when unauthorized", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const formData = createMockFormData({
        name: "Board",
        areaId: TEST_UUID,
      });
      await expect(createBoard(formData)).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateBoard", () => {
    it("updates a board", async () => {
      const updated = { id: TEST_UUID, name: "Updated Board" };
      mockReturning.mockResolvedValue([updated]);

      const formData = createMockFormData({
        name: "Updated Board",
        description: "Updated",
        areaId: TEST_UUID,
      });

      const result = await updateBoard(TEST_UUID, formData);
      expect(result).toEqual(updated);
    });
  });

  describe("deleteBoard", () => {
    it("deletes a board", async () => {
      const deleted = { id: TEST_UUID, area_id: TEST_UUID };
      mockReturning.mockResolvedValue([deleted]);

      await deleteBoard(TEST_UUID);
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
