"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { boards, columns } from "@/lib/db/schema";
import { boardSchema } from "@/lib/validations/board";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createBoard(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const areaId = formData.get("areaId") as string;

  const validated = boardSchema.parse({ name, description, areaId });

  const [newBoard] = await db.insert(boards).values({
    ...validated,
  }).returning();

  // Create default columns
  await db.insert(columns).values([
    { board_id: newBoard.id, name: "To Do", position: 0 },
    { board_id: newBoard.id, name: "In Progress", position: 1 },
    { board_id: newBoard.id, name: "Done", position: 2 },
  ]);

  revalidatePath(`/areas/${areaId}`);
  return newBoard;
}

export async function updateBoard(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const areaId = formData.get("areaId") as string;

  const validated = boardSchema.parse({ name, description, areaId });

  const [updatedBoard] = await db
    .update(boards)
    .set({ ...validated, updated_at: new Date() })
    .where(eq(boards.id, id))
    .returning();

  revalidatePath(`/areas/${areaId}`);
  return updatedBoard;
}

export async function deleteBoard(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [deletedBoard] = await db
    .delete(boards)
    .where(eq(boards.id, id))
    .returning();

  if (deletedBoard) {
    revalidatePath(`/areas/${deletedBoard.area_id}`);
  }
}
