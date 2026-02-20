"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { habits, habitLogs } from "@/lib/db/schema";
import { habitSchema } from "@/lib/validations/habit";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";

export async function createHabit(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const areaId = (formData.get("areaId") as string) || null;
  const frequency = formData.get("frequency") as "daily" | "weekly" | "custom";
  const targetCount = parseInt((formData.get("targetCount") as string) || "1");

  const validated = habitSchema.parse({
    name,
    description,
    areaId,
    frequency,
    targetCount,
  });

  const [newHabit] = await db
    .insert(habits)
    .values({
      user_id: user.id,
      area_id: validated.areaId,
      name: validated.name,
      description: validated.description,
      frequency: validated.frequency,
      target_count: validated.targetCount,
    })
    .returning();

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return newHabit;
}

export async function updateHabit(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const areaId = (formData.get("areaId") as string) || null;
  const frequency = formData.get("frequency") as "daily" | "weekly" | "custom";
  const targetCount = parseInt((formData.get("targetCount") as string) || "1");

  const validated = habitSchema.parse({
    name,
    description,
    areaId,
    frequency,
    targetCount,
  });

  const [updatedHabit] = await db
    .update(habits)
    .set({
      area_id: validated.areaId,
      name: validated.name,
      description: validated.description,
      frequency: validated.frequency,
      target_count: validated.targetCount,
      updated_at: new Date(),
    })
    .where(eq(habits.id, id))
    .returning();

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return updatedHabit;
}

export async function deleteHabit(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(habits).where(eq(habits.id, id));

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function logHabit(habitId: string, date: Date = new Date()) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if already logged today
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existing = await db.query.habitLogs.findFirst({
    where: and(
      eq(habitLogs.habit_id, habitId),
      gte(habitLogs.completed_at, dayStart),
      lte(habitLogs.completed_at, dayEnd),
    ),
  });

  if (existing) {
    // Increment value or just return
    await db
      .update(habitLogs)
      .set({ value: existing.value + 1 })
      .where(eq(habitLogs.id, existing.id));
  } else {
    await db.insert(habitLogs).values({
      habit_id: habitId,
      completed_at: date,
      value: 1,
    });
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function unlogHabit(habitId: string, date: Date = new Date()) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  await db
    .delete(habitLogs)
    .where(
      and(
        eq(habitLogs.habit_id, habitId),
        gte(habitLogs.completed_at, dayStart),
        lte(habitLogs.completed_at, dayEnd),
      ),
    );

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}
