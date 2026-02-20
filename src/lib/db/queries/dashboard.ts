import { db } from "@/lib/db";
import { tasks, projects, columns, boards, lifeAreas } from "@/lib/db/schema";
import { and, eq, lt, gte, lte, desc, count, or, ne, sql } from "drizzle-orm";
import { addDays, startOfDay, endOfDay } from "date-fns";

export async function getTodaysTasks(userId: string) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const result = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.due_date,
      completedAt: tasks.completed_at,
      projectId: projects.id,
      projectTitle: projects.title,
      areaId: lifeAreas.id,
      areaName: lifeAreas.name,
      areaColor: lifeAreas.color,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        gte(tasks.due_date, todayStart),
        lte(tasks.due_date, todayEnd),
      ),
    )
    .orderBy(desc(tasks.priority), tasks.created_at);

  return result;
}

export async function getUpcomingTasks(userId: string, days: number = 7) {
  const todayEnd = endOfDay(new Date());
  const futureDate = endOfDay(addDays(new Date(), days));

  const result = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.due_date,
      projectId: projects.id,
      projectTitle: projects.title,
      areaId: lifeAreas.id,
      areaName: lifeAreas.name,
      areaColor: lifeAreas.color,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        gte(tasks.due_date, todayEnd), // Start after today
        lte(tasks.due_date, futureDate),
        ne(tasks.status, "done"), // Only pending tasks
      ),
    )
    .orderBy(tasks.due_date, desc(tasks.priority));

  return result;
}

export async function getOverdueTasks(userId: string) {
  const now = new Date();

  const result = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.due_date,
      projectId: projects.id,
      projectTitle: projects.title,
      areaId: lifeAreas.id,
      areaName: lifeAreas.name,
      areaColor: lifeAreas.color,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        lt(tasks.due_date, now),
        ne(tasks.status, "done"),
      ),
    )
    .orderBy(tasks.due_date, desc(tasks.priority));

  return result;
}

export async function getRecentActivity(userId: string, limit: number = 10) {
  // Fetch recent tasks
  const recentTasks = await db
    .select({
      id: tasks.id,
      type: sql<string>`'task'`,
      title: tasks.title,
      updatedAt: tasks.updated_at,
      status: tasks.status,
      parentId: tasks.project_id,
      parentTitle: projects.title,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(eq(lifeAreas.user_id, userId))
    .orderBy(desc(tasks.updated_at))
    .limit(limit);

  // Fetch recent projects
  const recentProjects = await db
    .select({
      id: projects.id,
      type: sql<string>`'project'`,
      title: projects.title,
      updatedAt: projects.updated_at,
      status: sql<string>`'active'`, // Projects don't have status same as tasks
      parentId: columns.id, // Just placeholders
      parentTitle: columns.name,
    })
    .from(projects)
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(eq(lifeAreas.user_id, userId))
    .orderBy(desc(projects.updated_at))
    .limit(limit);

  // Combine and sort
  const combined = [...recentTasks, ...recentProjects]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);

  return combined;
}

export async function getDashboardStats(userId: string) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const now = new Date();

  // Total tasks (not done)
  const totalTasksQuery = db
    .select({ count: count() })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(and(eq(lifeAreas.user_id, userId), ne(tasks.status, "done")));

  // Completed today
  const completedTodayQuery = db
    .select({ count: count() })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "done"),
        gte(tasks.completed_at, todayStart),
        lte(tasks.completed_at, todayEnd),
      ),
    );

  // Overdue
  const overdueQuery = db
    .select({ count: count() })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        ne(tasks.status, "done"),
        lt(tasks.due_date, now),
      ),
    );

  const [totalTasks, completedToday, overdue] = await Promise.all([
    totalTasksQuery,
    completedTodayQuery,
    overdueQuery,
  ]);

  return {
    totalTasks: totalTasks[0]?.count ?? 0,
    completedToday: completedToday[0]?.count ?? 0,
    overdue: overdue[0]?.count ?? 0,
    activeStreak: 0, // Placeholder for now, requires habits
  };
}
