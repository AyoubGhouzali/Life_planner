import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockFormData, mockSupabaseClient } from "./helpers";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { signIn, signUp, signOut, resetPassword } from "../auth-actions";
import { redirect } from "next/navigation";

describe("auth-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    it("signs in with valid credentials and redirects", async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      const formData = createMockFormData({
        email: "test@example.com",
        password: "password123",
      });

      await signIn(formData);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("returns error on failed sign in", async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: { message: "Invalid credentials" },
      });

      const formData = createMockFormData({
        email: "test@example.com",
        password: "wrong",
      });

      const result = await signIn(formData);
      expect(result).toEqual({ error: "Invalid credentials" });
    });
  });

  describe("signUp", () => {
    it("signs up with valid data and redirects", async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({ error: null });

      const formData = createMockFormData({
        email: "new@example.com",
        password: "password123",
      });

      await signUp(formData);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
      });
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("returns error on failed sign up", async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        error: { message: "Email already taken" },
      });

      const formData = createMockFormData({
        email: "existing@example.com",
        password: "password123",
      });

      const result = await signUp(formData);
      expect(result).toEqual({ error: "Email already taken" });
    });
  });

  describe("signOut", () => {
    it("signs out and redirects to login", async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({});

      await signOut();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("resetPassword", () => {
    it("sends reset email successfully", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const formData = createMockFormData({ email: "test@example.com" });
      const result = await resetPassword(formData);

      expect(result).toEqual({
        success: "Check your email for the reset link.",
      });
    });

    it("returns error on failure", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: "User not found" },
      });

      const formData = createMockFormData({ email: "nonexistent@example.com" });
      const result = await resetPassword(formData);

      expect(result).toEqual({ error: "User not found" });
    });
  });
});
