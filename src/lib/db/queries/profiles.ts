import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getProfile(userId: string) {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
