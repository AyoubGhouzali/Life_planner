import { db } from "@/lib/db";
import {
  tasks,
  projects,
  notes,
  columns,
  boards,
  lifeAreas,
} from "@/lib/db/schema";
import { eq, ilike, and, desc } from "drizzle-orm";

export async function searchAll(userId: string, query: string) {
  const searchPattern = `%${query}%`;

  const foundTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      projectId: projects.id,
      projectTitle: projects.title,
      areaId: lifeAreas.id,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(eq(lifeAreas.user_id, userId), ilike(tasks.title, searchPattern)),
    )
    .limit(5);

  const foundProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      areaId: lifeAreas.id,
    })
    .from(projects)
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(eq(lifeAreas.user_id, userId), ilike(projects.title, searchPattern)),
    )
    .limit(5);

  const foundNotes = await db
    .select({
      id: notes.id,
      title: notes.title,
      projectId: projects.id,
      projectTitle: projects.title,
      areaId: lifeAreas.id,
    })
    .from(notes)
    .innerJoin(projects, eq(notes.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(eq(lifeAreas.user_id, userId), ilike(notes.title, searchPattern)),
    )
    .limit(5);

  return {
    tasks: foundTasks,
    projects: foundProjects,
    notes: foundNotes,
  };
}
