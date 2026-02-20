import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockSupabaseClient, mockUser, TEST_UUID } from "./helpers";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockWhere = vi.fn().mockResolvedValue(undefined);
const mockSet = vi.fn(() => ({ where: mockWhere }));

vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn(() => ({ set: mockSet })),
    delete: vi.fn(() => ({ where: mockWhere })),
    query: {
      profiles: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  profiles: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
}));

import {
  updateProfile,
  updateSettings,
  deleteAccount,
  exportUserData,
} from "../profile-actions";
import { db } from "@/lib/db";

describe("profile-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateProfile", () => {
    it("updates profile successfully", async () => {
      const result = await updateProfile(mockUser.id, {
        displayName: "John",
        avatarUrl: "https://example.com/avatar.png",
      });

      expect(result).toEqual({ success: true });
      expect(db.update).toHaveBeenCalled();
    });

    it("returns error on failure", async () => {
      mockSet.mockImplementationOnce(() => {
        throw new Error("DB error");
      });

      const result = await updateProfile(mockUser.id, { displayName: "John" });
      expect(result).toEqual({
        success: false,
        error: "Failed to update profile",
      });
    });
  });

  describe("updateSettings", () => {
    it("updates settings successfully", async () => {
      const result = await updateSettings(mockUser.id, {
        theme: "dark",
      });

      expect(result).toEqual({ success: true });
    });

    it("returns error on failure", async () => {
      mockSet.mockImplementationOnce(() => {
        throw new Error("DB error");
      });

      const result = await updateSettings(mockUser.id, {});
      expect(result).toEqual({
        success: false,
        error: "Failed to update settings",
      });
    });
  });

  describe("deleteAccount", () => {
    it("deletes account and signs out", async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({});

      const result = await deleteAccount(mockUser.id);
      expect(result).toEqual({ success: true });
      expect(db.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it("returns error on failure", async () => {
      mockWhere.mockImplementationOnce(() => {
        throw new Error("DB error");
      });

      const result = await deleteAccount(mockUser.id);
      expect(result).toEqual({
        success: false,
        error: "Failed to delete account",
      });
    });
  });

  describe("exportUserData", () => {
    it("exports user data successfully", async () => {
      const userData = { id: mockUser.id, display_name: "John" };
      (db.query.profiles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        userData,
      );

      const result = await exportUserData(mockUser.id);
      expect(result).toEqual({ success: true, data: userData });
    });

    it("returns error on failure", async () => {
      (db.query.profiles.findFirst as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("DB error"),
      );

      const result = await exportUserData(mockUser.id);
      expect(result).toEqual({
        success: false,
        error: "Failed to export data",
      });
    });
  });
});
