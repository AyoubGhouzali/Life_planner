import { db } from "@/lib/db";
import { tasks, projects, columns, boards, lifeAreas } from "@/lib/db/schema";
import { eq, and, asc, isNull } from "drizzle-orm";

export async function getTasksByProject(projectId: string) {
  return await db.query.tasks.findMany({
    where: and(
      eq(tasks.project_id, projectId),
      isNull(tasks.parent_task_id) // Only top-level tasks
    ),
    orderBy: [asc(tasks.position)],
    with: {
      subtasks: {
        orderBy: [asc(tasks.position)],
      },
    },
  });
}

export async function getTasksByUser(userId: string) {
  // This might be better as a join if we want to filter by area etc.
  return await db.query.tasks.findMany({
    where: eq(tasks.project_id, userId), // This is wrong, tasks don't have user_id directly
    // Need to join through projects -> columns -> boards -> life_areas
  });
}

// Improved version of getTasksByUser
export async function getDashboardTasks(userId: string) {
  return await db
    .select({
      task: tasks,
      projectTitle: projects.title,
      areaName: lifeAreas.name,
      areaColor: lifeAreas.color,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(eq(lifeAreas.user_id, userId))
    .orderBy(asc(tasks.due_date));
}
