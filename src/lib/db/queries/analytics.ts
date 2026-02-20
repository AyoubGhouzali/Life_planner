import { db } from "../index";
import {
  tasks,
  projects,
  columns,
  boards,
  lifeAreas,
  habitLogs,
  habits,
  timeEntries,
} from "../schema";
import { eq, and, gte, lte, sql, desc, asc } from "drizzle-orm";

export type AnalyticsPeriod = "week" | "month" | "last30" | "last90" | "custom";

export async function getCompletionOverTime(
  userId: string,
  period: AnalyticsPeriod,
  dateRange?: { from: Date; to: Date },
) {
  let fromDate = new Date();
  const toDate = dateRange?.to || new Date();

  if (dateRange?.from) {
    fromDate = dateRange.from;
  } else {
    switch (period) {
      case "week":
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case "month":
        fromDate.setMonth(fromDate.getMonth() - 1);
        fromDate.setDate(1);
        break;
      case "last30":
        fromDate.setDate(fromDate.getDate() - 30);
        break;
      case "last90":
        fromDate.setDate(fromDate.getDate() - 90);
        break;
    }
  }

  const result = await db
    .select({
      date: sql<string>`DATE(${tasks.completed_at})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "done"),
        gte(tasks.completed_at, fromDate),
        lte(tasks.completed_at, toDate),
      ),
    )
    .groupBy(sql`DATE(${tasks.completed_at})`)
    .orderBy(sql`DATE(${tasks.completed_at})`);

  return result;
}

export async function getAreaDistribution(
  userId: string,
  dateRange: { from: Date; to: Date },
) {
  const result = await db
    .select({
      areaName: lifeAreas.name,
      areaColor: lifeAreas.color,
      taskCount: sql<number>`COUNT(${tasks.id})`,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "done"),
        gte(tasks.completed_at, dateRange.from),
        lte(tasks.completed_at, dateRange.to),
      ),
    )
    .groupBy(lifeAreas.id, lifeAreas.name, lifeAreas.color);

  return result;
}

export async function getProductivityTrends(userId: string) {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const thisWeekTasks = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "done"),
        gte(tasks.completed_at, thisWeekStart),
      ),
    );

  const lastWeekTasks = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "done"),
        gte(tasks.completed_at, lastWeekStart),
        lte(tasks.completed_at, thisWeekStart),
      ),
    );

  return {
    thisWeek: thisWeekTasks[0]?.count || 0,
    lastWeek: lastWeekTasks[0]?.count || 0,
  };
}

export async function getLifeBalanceScores(
  userId: string,
  dateRange: { from: Date; to: Date },
) {
  // Score based on activity (tasks completed + habits logged + time tracked)
  const areaActivity = await db
    .select({
      areaId: lifeAreas.id,
      areaName: lifeAreas.name,
      taskCount: sql<number>`COUNT(DISTINCT ${tasks.id})`,
      habitCount: sql<number>`COUNT(DISTINCT ${habitLogs.id})`,
      totalTime: sql<number>`COALESCE(SUM(${timeEntries.duration}), 0)`,
    })
    .from(lifeAreas)
    .leftJoin(boards, eq(lifeAreas.id, boards.area_id))
    .leftJoin(columns, eq(boards.id, columns.board_id))
    .leftJoin(projects, eq(columns.id, projects.column_id))
    .leftJoin(
      tasks,
      and(
        eq(projects.id, tasks.project_id),
        eq(tasks.status, "done"),
        gte(tasks.completed_at, dateRange.from),
        lte(tasks.completed_at, dateRange.to),
      ),
    )
    .leftJoin(habits, eq(lifeAreas.id, habits.area_id))
    .leftJoin(
      habitLogs,
      and(
        eq(habits.id, habitLogs.habit_id),
        gte(habitLogs.completed_at, dateRange.from),
        lte(habitLogs.completed_at, dateRange.to),
      ),
    )
    .leftJoin(
      timeEntries,
      and(
        eq(projects.id, timeEntries.project_id),
        gte(timeEntries.start_time, dateRange.from),
        lte(timeEntries.start_time, dateRange.to),
      ),
    )
    .where(eq(lifeAreas.user_id, userId))
    .groupBy(lifeAreas.id, lifeAreas.name);

  return areaActivity.map((area) => ({
    name: area.areaName,
    score:
      area.taskCount * 10 +
      area.habitCount * 5 +
      Math.floor(area.totalTime / 3600) * 2,
  }));
}

export async function getOverdueAnalysis(userId: string) {
  const result = await db
    .select({
      areaName: lifeAreas.name,
      overdueCount: sql<number>`COUNT(${tasks.id})`,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "todo"),
        sql`${tasks.due_date} < NOW()`,
      ),
    )
    .groupBy(lifeAreas.name);

  return result;
}

export async function getStreakSummary(userId: string) {
  // This is a bit complex for a single query, but we can get the active habits
  const userHabits = await db
    .select({
      id: habits.id,
      name: habits.name,
    })
    .from(habits)
    .where(and(eq(habits.user_id, userId), eq(habits.is_archived, false)));

  // For each habit, we'd normally calculate the streak.
  // For simplicity in this query layer, we might want to move streak logic to a utility.
  // But let's at least get the completion count in the last 30 days.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const habitsWithStats = await db
    .select({
      id: habits.id,
      name: habits.name,
      completionCount: sql<number>`COUNT(${habitLogs.id})`,
    })
    .from(habits)
    .leftJoin(
      habitLogs,
      and(
        eq(habits.id, habitLogs.habit_id),
        gte(habitLogs.completed_at, thirtyDaysAgo),
      ),
    )
    .where(and(eq(habits.user_id, userId), eq(habits.is_archived, false)))
    .groupBy(habits.id, habits.name);

  return habitsWithStats;
}

export async function getTimeDistribution(
  userId: string,
  dateRange: { from: Date; to: Date },
) {
  const result = await db
    .select({
      areaName: lifeAreas.name,
      totalDuration: sql<number>`SUM(${timeEntries.duration})`,
    })
    .from(timeEntries)
    .innerJoin(projects, eq(timeEntries.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        gte(timeEntries.start_time, dateRange.from),
        lte(timeEntries.start_time, dateRange.to),
      ),
    )
    .groupBy(lifeAreas.name);

  return result;
}

export async function getMostActiveAreas(
  userId: string,
  dateRange: { from: Date; to: Date },
) {
  const result = await db
    .select({
      areaName: lifeAreas.name,
      activityCount: sql<number>`COUNT(${tasks.id}) + COUNT(${habitLogs.id})`,
    })
    .from(lifeAreas)
    .leftJoin(boards, eq(lifeAreas.id, boards.area_id))
    .leftJoin(columns, eq(boards.id, columns.board_id))
    .leftJoin(projects, eq(columns.id, projects.column_id))
    .leftJoin(
      tasks,
      and(
        eq(projects.id, tasks.project_id),
        gte(tasks.updated_at, dateRange.from),
        lte(tasks.updated_at, dateRange.to),
      ),
    )
    .leftJoin(habits, eq(lifeAreas.id, habits.area_id))
    .leftJoin(
      habitLogs,
      and(
        eq(habits.id, habitLogs.habit_id),
        gte(habitLogs.completed_at, dateRange.from),
        lte(habitLogs.completed_at, dateRange.to),
      ),
    )
    .where(eq(lifeAreas.user_id, userId))
    .groupBy(lifeAreas.id, lifeAreas.name)
    .orderBy(desc(sql`activityCount`))
    .limit(5);

  return result;
}

export async function getWeeklySummary(userId: string) {
  const now = new Date();
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 7);

  const completedTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      completedAt: tasks.completed_at,
      areaName: lifeAreas.name,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "done"),
        gte(tasks.completed_at, lastWeekStart),
      ),
    );

  const overdueTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      dueDate: tasks.due_date,
      areaName: lifeAreas.name,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.project_id, projects.id))
    .innerJoin(columns, eq(projects.column_id, columns.id))
    .innerJoin(boards, eq(columns.board_id, boards.id))
    .innerJoin(lifeAreas, eq(boards.area_id, lifeAreas.id))
    .where(
      and(
        eq(lifeAreas.user_id, userId),
        eq(tasks.status, "todo"),
        sql`${tasks.due_date} < NOW()`,
      ),
    );

  const habitStats = await db
    .select({
      name: habits.name,
      count: sql<number>`COUNT(${habitLogs.id})`,
    })
    .from(habits)
    .leftJoin(
      habitLogs,
      and(
        eq(habits.id, habitLogs.habit_id),
        gte(habitLogs.completed_at, lastWeekStart),
      ),
    )
    .where(and(eq(habits.user_id, userId), eq(habits.is_archived, false)))
    .groupBy(habits.id, habits.name);

  return {
    completedTasks,
    overdueTasks,
    habitStats,
  };
}
