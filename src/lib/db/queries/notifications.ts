import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, isNull, isNotNull } from "drizzle-orm";

export async function getNotifications(userId: string) {
  try {
    const unread = await db.query.notifications.findMany({
      where: and(
        eq(notifications.user_id, userId),
        isNull(notifications.read_at),
      ),
      orderBy: desc(notifications.created_at),
    });

    const recentRead = await db.query.notifications.findMany({
      where: and(
        eq(notifications.user_id, userId),
        isNotNull(notifications.read_at),
      ),
      orderBy: desc(notifications.created_at),
      limit: 5,
    });

    return { unread, recentRead };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { unread: [], recentRead: [] };
  }
}
