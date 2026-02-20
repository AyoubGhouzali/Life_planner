"use server";

import { db } from "@/lib/db";
import { notifications, tasks } from "@/lib/db/schema";
import { eq, and, isNull, lt, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDashboardTasks } from "@/lib/db/queries/tasks";

export async function markAsRead(id: string) {
  try {
    await db
      .update(notifications)
      .set({
        read_at: new Date(),
      })
      .where(eq(notifications.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await db
      .update(notifications)
      .set({
        read_at: new Date(),
      })
      .where(
        and(eq(notifications.user_id, userId), isNull(notifications.read_at)),
      );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

export async function generateNotifications(userId: string) {
  try {
    const allTasks = await getDashboardTasks(userId);
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const existingNotifications = await db.query.notifications.findMany({
      where: eq(notifications.user_id, userId),
    });

    for (const { task } of allTasks) {
      if (task.completed_at) continue;
      if (!task.due_date) continue;

      const dueDate = new Date(task.due_date);
      const isOverdue = dueDate < todayStart;
      const isDueToday =
        dueDate >= todayStart &&
        dueDate < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      if (isOverdue) {
        // Check if we already have an overdue notification for this task created TODAY
        // Or if we just want to notify once ever? Let's do once per day.
        const hasNotificationToday = existingNotifications.some(
          (n) =>
            n.type === "overdue" &&
            n.link === `/tasks/${task.id}` &&
            n.created_at >= todayStart,
        );

        if (!hasNotificationToday) {
          await db.insert(notifications).values({
            user_id: userId,
            title: `Overdue Task: ${task.title}`,
            message: `Task "${task.title}" was due on ${dueDate.toLocaleDateString()}.`,
            type: "overdue",
            link: `/tasks/${task.id}`,
          });
        }
      } else if (isDueToday) {
        const hasNotification = existingNotifications.some(
          (n) => n.type === "due_today" && n.link === `/tasks/${task.id}`,
        );

        if (!hasNotification) {
          await db.insert(notifications).values({
            user_id: userId,
            title: `Task Due Today: ${task.title}`,
            message: `Task "${task.title}" is due today.`,
            type: "due_today",
            link: `/tasks/${task.id}`,
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error generating notifications:", error);
    return { success: false, error: "Failed to generate notifications" };
  }
}
