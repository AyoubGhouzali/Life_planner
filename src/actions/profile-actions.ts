"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(
  userId: string,
  data: { displayName?: string; avatarUrl?: string },
) {
  try {
    await db
      .update(profiles)
      .set({
        display_name: data.displayName,
        avatar_url: data.avatarUrl,
        updated_at: new Date(),
      })
      .where(eq(profiles.id, userId));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updateSettings(userId: string, settings: any) {
  try {
    await db
      .update(profiles)
      .set({
        settings: settings,
        updated_at: new Date(),
      })
      .where(eq(profiles.id, userId));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function deleteAccount(userId: string) {
  const supabase = await createClient();

  try {
    // Delete user from Supabase Auth
    // Note: This requires the service role key if run from server action context directly on auth.admin
    // but typically users delete their own account via client SDK or an edge function.
    // However, Supabase Auth Admin API is needed for complete deletion.
    // Alternatively, we can just delete the profile and let the user remain in Auth (orphaned),
    // or use a Postgres trigger to delete from auth.users.

    // For now, we'll try to delete from the public profiles table which should cascade delete
    // everything else related to the user in the public schema.
    // The auth user deletion usually requires admin privileges or calling deleteUser via the client if it's the own user.
    // Standard practice: Call supabase.auth.admin.deleteUser(userId) in a secure environment.

    // Since we are in a server action with user context, we might not have admin rights.
    // Let's assume we delete the profile first.

    await db.delete(profiles).where(eq(profiles.id, userId));

    // Sign out
    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

export async function exportUserData(userId: string) {
  try {
    const data = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      with: {
        lifeAreas: {
          with: {
            boards: {
              with: {
                columns: {
                  with: {
                    projects: {
                      with: {
                        tasks: true,
                        notes: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        habits: true,
        goals: true,
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error exporting data:", error);
    return { success: false, error: "Failed to export data" };
  }
}
