"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { projects, columns, boards } from "@/lib/db/schema";
import { projectSchema } from "@/lib/validations/project";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const priority = formData.get("priority") as
    | "low"
    | "medium"
    | "high"
    | "urgent";
  const dueDate = (formData.get("dueDate") as string) || null;
  const columnId = formData.get("columnId") as string;
  const isProcess = formData.get("isProcess") === "true";
  const tags = formData.get("tags")
    ? JSON.parse(formData.get("tags") as string)
    : [];

  const validated = projectSchema.parse({
    title,
    description,
    priority,
    dueDate,
    columnId,
    isProcess,
    tags,
  });

  const [newProject] = await db
    .insert(projects)
    .values({
      column_id: validated.columnId,
      title: validated.title,
      description: validated.description,
      priority: validated.priority,
      due_date: validated.dueDate ? new Date(validated.dueDate) : null,
      is_process: validated.isProcess,
      tags: validated.tags,
    })
    .returning();

  const column = await db.query.columns.findFirst({
    where: eq(columns.id, validated.columnId),
    with: {
      board: true,
    },
  });

  if (column?.board) {
    revalidatePath(`/areas/${column.board.area_id}`);
  }

  return newProject;
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const priority = formData.get("priority") as
    | "low"
    | "medium"
    | "high"
    | "urgent";
  const dueDate = (formData.get("dueDate") as string) || null;
  const columnId = formData.get("columnId") as string;
  const isProcess = formData.get("isProcess") === "true";
  const tags = formData.get("tags")
    ? JSON.parse(formData.get("tags") as string)
    : [];

  const validated = projectSchema.parse({
    title,
    description,
    priority,
    dueDate,
    columnId,
    isProcess,
    tags,
  });

  const [updatedProject] = await db
    .update(projects)
    .set({
      column_id: validated.columnId,
      title: validated.title,
      description: validated.description,
      priority: validated.priority,
      due_date: validated.dueDate ? new Date(validated.dueDate) : null,
      is_process: validated.isProcess,
      tags: validated.tags,
      updated_at: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  const column = await db.query.columns.findFirst({
    where: eq(columns.id, updatedProject.column_id),
    with: {
      board: true,
    },
  });

  if (column?.board) {
    revalidatePath(`/areas/${column.board.area_id}`);
  }

  return updatedProject;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [deletedProject] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning();

  if (deletedProject) {
    const column = await db.query.columns.findFirst({
      where: eq(columns.id, deletedProject.column_id),
      with: {
        board: true,
      },
    });

    if (column?.board) {
      revalidatePath(`/areas/${column.board.area_id}`);
    }
  }
}

export async function moveProject(
  id: string,
  toColumnId: string,
  position: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [updatedProject] = await db
    .update(projects)
    .set({
      column_id: toColumnId,
      position: position,
      updated_at: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  const column = await db.query.columns.findFirst({
    where: eq(columns.id, toColumnId),
    with: {
      board: true,
    },
  });

  if (column?.board) {
    revalidatePath(`/areas/${column.board.area_id}`);
  }

  return updatedProject;
}

export async function archiveProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) throw new Error("Project not found");

  const [updatedProject] = await db
    .update(projects)
    .set({
      is_archived: !project.is_archived,
      updated_at: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  const column = await db.query.columns.findFirst({
    where: eq(columns.id, updatedProject.column_id),
    with: {
      board: true,
    },
  });

  if (column?.board) {
    revalidatePath(`/areas/${column.board.area_id}`);
  }

  return updatedProject;
}
