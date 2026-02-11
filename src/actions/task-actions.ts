"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { tasks, projects, columns, boards } from "@/lib/db/schema";
import { taskSchema } from "@/lib/validations/task";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const parentTaskId = formData.get("parentTaskId") as string || null;
  const status = formData.get("status") as "todo" | "in_progress" | "done";
  const priority = formData.get("priority") as "low" | "medium" | "high" | "urgent";
  const dueDate = formData.get("dueDate") as string || null;
  const isRecurring = formData.get("isRecurring") === "true";
  const recurrenceRule = formData.get("recurrenceRule") as string || null;

  const validated = taskSchema.parse({
    title,
    projectId,
    parentTaskId,
    status,
    priority,
    dueDate,
    isRecurring,
    recurrenceRule,
  });

  const [newTask] = await db.insert(tasks).values({
    project_id: validated.projectId,
    parent_task_id: validated.parentTaskId,
    title: validated.title,
    status: validated.status,
    priority: validated.priority,
    due_date: validated.dueDate ? new Date(validated.dueDate) : null,
    is_recurring: validated.isRecurring,
    recurrence_rule: validated.recurrenceRule,
  }).returning();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, validated.projectId),
    with: {
      column: {
        with: {
          board: true
        }
      }
    }
  });

  if (project?.column?.board) {
    revalidatePath(`/areas/${project.column.board.area_id}`);
  }

  return newTask;
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const parentTaskId = formData.get("parentTaskId") as string || null;
  const status = formData.get("status") as "todo" | "in_progress" | "done";
  const priority = formData.get("priority") as "low" | "medium" | "high" | "urgent";
  const dueDate = formData.get("dueDate") as string || null;
  const isRecurring = formData.get("isRecurring") === "true";
  const recurrenceRule = formData.get("recurrenceRule") as string || null;

  const validated = taskSchema.parse({
    title,
    projectId,
    parentTaskId,
    status,
    priority,
    dueDate,
    isRecurring,
    recurrenceRule,
  });

  const [updatedTask] = await db
    .update(tasks)
    .set({
      title: validated.title,
      status: validated.status,
      priority: validated.priority,
      due_date: validated.dueDate ? new Date(validated.dueDate) : null,
      is_recurring: validated.isRecurring,
      recurrence_rule: validated.recurrenceRule,
      updated_at: new Date()
    })
    .where(eq(tasks.id, id))
    .returning();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, updatedTask.project_id),
    with: {
      column: {
        with: {
          board: true
        }
      }
    }
  });

  if (project?.column?.board) {
    revalidatePath(`/areas/${project.column.board.area_id}`);
  }

  return updatedTask;
}

export async function toggleTask(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });

  if (!task) throw new Error("Task not found");

  const newStatus = task.status === "done" ? "todo" : "done";
  const completedAt = newStatus === "done" ? new Date() : null;

  const [updatedTask] = await db
    .update(tasks)
    .set({
      status: newStatus,
      completed_at: completedAt,
      updated_at: new Date()
    })
    .where(eq(tasks.id, id))
    .returning();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, updatedTask.project_id),
    with: {
      column: {
        with: {
          board: true
        }
      }
    }
  });

  if (project?.column?.board) {
    revalidatePath(`/areas/${project.column.board.area_id}`);
  }

  return updatedTask;
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [deletedTask] = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();

  if (deletedTask) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, deletedTask.project_id),
      with: {
        column: {
          with: {
            board: true
          }
        }
      }
    });

    if (project?.column?.board) {
      revalidatePath(`/areas/${project.column.board.area_id}`);
    }
  }
}

export async function reorderTasks(orderedIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(tasks)
        .set({ position: index })
        .where(eq(tasks.id, id))
    )
  );

  const firstTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, orderedIds[0]),
    with: {
      project: {
        with: {
          column: {
            with: {
              board: true
            }
          }
        }
      }
    }
  });

  if (firstTask?.project?.column?.board) {
    revalidatePath(`/areas/${firstTask.project.column.board.area_id}`);
  }
}
