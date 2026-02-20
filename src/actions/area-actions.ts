"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { lifeAreas } from "@/lib/db/schema";
import { areaSchema } from "@/lib/validations/area";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createArea(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string;
  const color = formData.get("color") as string;
  const description = formData.get("description") as string;

  const validated = areaSchema.parse({ name, icon, color, description });

  const [newArea] = await db
    .insert(lifeAreas)
    .values({
      ...validated,
      user_id: user.id,
    })
    .returning();

  revalidatePath("/", "layout");
  return newArea;
}

export async function updateArea(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string;
  const color = formData.get("color") as string;
  const description = formData.get("description") as string;

  const validated = areaSchema.parse({ name, icon, color, description });

  const [updatedArea] = await db
    .update(lifeAreas)
    .set({ ...validated, updated_at: new Date() })
    .where(and(eq(lifeAreas.id, id), eq(lifeAreas.user_id, user.id)))
    .returning();

  revalidatePath("/", "layout");
  return updatedArea;
}

export async function deleteArea(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(lifeAreas)
    .where(and(eq(lifeAreas.id, id), eq(lifeAreas.user_id, user.id)));

  revalidatePath("/", "layout");
}

export async function archiveArea(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const area = await db.query.lifeAreas.findFirst({
    where: and(eq(lifeAreas.id, id), eq(lifeAreas.user_id, user.id)),
  });

  if (!area) throw new Error("Area not found");

  await db
    .update(lifeAreas)
    .set({ is_archived: !area.is_archived, updated_at: new Date() })
    .where(and(eq(lifeAreas.id, id), eq(lifeAreas.user_id, user.id)));

  revalidatePath("/", "layout");
}

export async function reorderAreas(orderedIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(lifeAreas)
        .set({ position: index })
        .where(and(eq(lifeAreas.id, id), eq(lifeAreas.user_id, user.id))),
    ),
  );

  revalidatePath("/", "layout");
}
