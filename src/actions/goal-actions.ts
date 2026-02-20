"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { goals, goalProjects } from "@/lib/db/schema";
import { goalSchema } from "@/lib/validations/goal";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const targetDate = (formData.get("targetDate") as string) || null;
  const targetValue = parseInt((formData.get("targetValue") as string) || "0");
  const unit = (formData.get("unit") as string) || null;

  const validated = goalSchema.parse({
    title,
    description,
    targetDate,
    targetValue,
    unit,
  });

  const [newGoal] = await db
    .insert(goals)
    .values({
      user_id: user.id,
      title: validated.title,
      description: validated.description,
      target_date: validated.targetDate ? new Date(validated.targetDate) : null,
      target_value: validated.targetValue,
      unit: validated.unit,
    })
    .returning();

  revalidatePath("/goals");
  return newGoal;
}

export async function updateGoal(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const targetDate = (formData.get("targetDate") as string) || null;
  const targetValue = parseInt((formData.get("targetValue") as string) || "0");
  const unit = (formData.get("unit") as string) || null;

  const validated = goalSchema.parse({
    title,
    description,
    targetDate,
    targetValue,
    unit,
  });

  const [updatedGoal] = await db
    .update(goals)
    .set({
      title: validated.title,
      description: validated.description,
      target_date: validated.targetDate ? new Date(validated.targetDate) : null,
      target_value: validated.targetValue,
      unit: validated.unit,
      updated_at: new Date(),
    })
    .where(and(eq(goals.id, id), eq(goals.user_id, user.id)))
    .returning();

  if (!updatedGoal) throw new Error("Goal not found");

  revalidatePath("/goals");
  return updatedGoal;
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.user_id, user.id)));
  revalidatePath("/goals");
}

export async function linkProjectToGoal(goalId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify the goal belongs to the user
  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.user_id, user.id)),
  });
  if (!goal) throw new Error("Goal not found");

  await db
    .insert(goalProjects)
    .values({
      goal_id: goalId,
      project_id: projectId,
    })
    .onConflictDoNothing();

  revalidatePath("/goals");
}

export async function unlinkProjectFromGoal(goalId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify the goal belongs to the user
  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.user_id, user.id)),
  });
  if (!goal) throw new Error("Goal not found");

  await db
    .delete(goalProjects)
    .where(
      and(
        eq(goalProjects.goal_id, goalId),
        eq(goalProjects.project_id, projectId),
      ),
    );

  revalidatePath("/goals");
}
