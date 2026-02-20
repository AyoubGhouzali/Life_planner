"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { columns, boards } from "@/lib/db/schema";
import { columnSchema } from "@/lib/validations/column";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createColumn(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || null;
  const boardId = formData.get("boardId") as string;
  const wipLimit = formData.get("wipLimit")
    ? parseInt(formData.get("wipLimit") as string)
    : null;

  const validated = columnSchema.parse({ name, color, boardId, wipLimit });

  const [newColumn] = await db
    .insert(columns)
    .values({
      board_id: validated.boardId,
      name: validated.name,
      color: validated.color,
      wip_limit: validated.wipLimit,
    })
    .returning();

  // We might need to find the areaId for revalidation
  const board = await db.query.boards.findFirst({
    where: eq(boards.id, validated.boardId),
  });

  if (board) {
    revalidatePath(`/areas/${board.area_id}`);
  }

  return newColumn;
}

export async function updateColumn(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || null;
  const boardId = formData.get("boardId") as string;
  const wipLimit = formData.get("wipLimit")
    ? parseInt(formData.get("wipLimit") as string)
    : null;

  const validated = columnSchema.parse({ name, color, boardId, wipLimit });

  const [updatedColumn] = await db
    .update(columns)
    .set({
      name: validated.name,
      color: validated.color,
      wip_limit: validated.wipLimit,
      updated_at: new Date(),
    })
    .where(eq(columns.id, id))
    .returning();

  const board = await db.query.boards.findFirst({
    where: eq(boards.id, updatedColumn.board_id),
  });

  if (board) {
    revalidatePath(`/areas/${board.area_id}`);
  }

  return updatedColumn;
}

export async function deleteColumn(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [deletedColumn] = await db
    .delete(columns)
    .where(eq(columns.id, id))
    .returning();

  if (deletedColumn) {
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, deletedColumn.board_id),
    });

    if (board) {
      revalidatePath(`/areas/${board.area_id}`);
    }
  }
}

export async function reorderColumns(orderedIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(columns).set({ position: index }).where(eq(columns.id, id)),
    ),
  );

  // Revalidate the area page
  const firstColumn = await db.query.columns.findFirst({
    where: eq(columns.id, orderedIds[0]),
    with: {
      board: true,
    },
  });

  if (firstColumn?.board) {
    revalidatePath(`/areas/${firstColumn.board.area_id}`);
  }
}
