"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { timeEntries } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { differenceInSeconds } from "date-fns";

export async function startTimer(projectId?: string, taskId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Stop any running timers for this user
  const runningTimers = await db.query.timeEntries.findMany({
    where: and(eq(timeEntries.user_id, user.id), isNull(timeEntries.end_time)),
  });

  for (const timer of runningTimers) {
    await stopTimer(timer.id);
  }

  const [newEntry] = await db
    .insert(timeEntries)
    .values({
      user_id: user.id,
      project_id: projectId || null,
      task_id: taskId || null,
      start_time: new Date(),
    })
    .returning();

  revalidatePath("/");
  return newEntry;
}

export async function stopTimer(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const entry = await db.query.timeEntries.findFirst({
    where: eq(timeEntries.id, id),
  });

  if (!entry) throw new Error("Entry not found");

  const endTime = new Date();
  const duration = differenceInSeconds(endTime, entry.start_time);

  const [updatedEntry] = await db
    .update(timeEntries)
    .set({
      end_time: endTime,
      duration,
    })
    .where(eq(timeEntries.id, id))
    .returning();

  revalidatePath("/");
  return updatedEntry;
}

export async function getRunningTimer(userId: string) {
  return await db.query.timeEntries.findFirst({
    where: and(eq(timeEntries.user_id, userId), isNull(timeEntries.end_time)),
    with: {
      project: true,
    },
  });
}

export async function deleteTimeEntry(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(timeEntries).where(eq(timeEntries.id, id));
  revalidatePath("/");
}
