"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { notes, projects } from "@/lib/db/schema";
import { noteSchema } from "@/lib/validations/note";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const validated = noteSchema.parse({
    projectId,
    title,
    content,
  });

  const [newNote] = await db
    .insert(notes)
    .values({
      project_id: validated.projectId,
      title: validated.title,
      content: validated.content,
    })
    .returning();

  // Revalidate project path
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, validated.projectId),
    with: { column: { with: { board: true } } },
  });
  if (project?.column?.board) {
    revalidatePath(`/areas/${project.column.board.area_id}`);
  }
  revalidatePath("/dashboard");

  return newNote;
}

export async function updateNote(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Partial validation as projectId isn't in form
  if (!title) throw new Error("Title required");

  const [updatedNote] = await db
    .update(notes)
    .set({
      title,
      content,
      updated_at: new Date(),
    })
    .where(eq(notes.id, id))
    .returning();

  const note = (await db.query.notes.findFirst({
    where: eq(notes.id, id),
    with: { project: { with: { column: { with: { board: true } } } } },
  })) as any;

  if (
    note &&
    note.project &&
    note.project.column &&
    note.project.column.board
  ) {
    revalidatePath(`/areas/${note.project.column.board.area_id}`);
  }
  revalidatePath("/dashboard");

  return updatedNote;
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const note = (await db.query.notes.findFirst({
    where: eq(notes.id, id),
    with: { project: { with: { column: { with: { board: true } } } } },
  })) as any;

  await db.delete(notes).where(eq(notes.id, id));

  if (
    note &&
    note.project &&
    note.project.column &&
    note.project.column.board
  ) {
    revalidatePath(`/areas/${note.project.column.board.area_id}`);
  }
  revalidatePath("/dashboard");
}

export async function togglePinNote(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const note = await db.query.notes.findFirst({
    where: eq(notes.id, id),
  });

  if (!note) throw new Error("Note not found");

  const [updatedNote] = await db
    .update(notes)
    .set({
      is_pinned: !note.is_pinned,
      updated_at: new Date(),
    })
    .where(eq(notes.id, id))
    .returning();

  // Revalidate logic...
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, updatedNote.project_id),
    with: { column: { with: { board: true } } },
  });
  if (project?.column?.board) {
    revalidatePath(`/areas/${project.column.board.area_id}`);
  }
  revalidatePath("/dashboard");

  return updatedNote;
}
