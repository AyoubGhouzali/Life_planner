import { vi } from "vitest";

export const mockUser = { id: "user-550e8400-e29b-41d4-a716-446655440000" };

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
};

export function createMockFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.set(key, value);
  }
  return formData;
}

export const TEST_UUID = "550e8400-e29b-41d4-a716-446655440000";
export const TEST_UUID_2 = "550e8400-e29b-41d4-a716-446655440001";
export const TEST_UUID_3 = "550e8400-e29b-41d4-a716-446655440002";
