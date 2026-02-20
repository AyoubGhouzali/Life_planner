import { db } from "@/lib/db";
import { projects, tasks, notes } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function getProjectsByColumn(columnId: string) {
  return await db.query.projects.findMany({
    where: and(
      eq(projects.column_id, columnId),
      eq(projects.is_archived, false),
    ),
    orderBy: [asc(projects.position)],
    with: {
      tasks: true,
    },
  });
}

export async function getProjectDetail(projectId: string) {
  return await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      tasks: {
        orderBy: [asc(tasks.position)],
        with: {
          subtasks: {
            orderBy: [asc(tasks.position)],
          },
        },
      },
      notes: {
        orderBy: [asc(notes.created_at)],
      },
      column: {
        with: {
          board: {
            with: {
              area: true,
            },
          },
        },
      },
    },
  });
}
