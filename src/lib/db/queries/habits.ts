import { db } from "@/lib/db";
import { habits, habitLogs, lifeAreas } from "@/lib/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import {
  startOfDay,
  endOfDay,
  subDays,
  isSameDay,
  differenceInDays,
} from "date-fns";

export async function getHabits(userId: string) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const userHabits = await db.query.habits.findMany({
    where: and(eq(habits.user_id, userId), eq(habits.is_archived, false)),
    with: {
      area: true,
      logs: {
        orderBy: [desc(habitLogs.completed_at)],
      },
    },
  });

  return userHabits.map((habit) => {
    const isCompletedToday = habit.logs.some(
      (log) => log.completed_at >= todayStart && log.completed_at <= todayEnd,
    );

    const { currentStreak, bestStreak } = calculateStreaks(habit.logs);

    return {
      ...habit,
      isCompletedToday,
      currentStreak,
      bestStreak,
    };
  });
}

export async function getHabitById(habitId: string) {
  return await db.query.habits.findFirst({
    where: eq(habits.id, habitId),
    with: {
      area: true,
      logs: {
        orderBy: [desc(habitLogs.completed_at)],
      },
    },
  });
}

export async function getTodaysHabits(userId: string) {
  const habitsList = await getHabits(userId);
  // For now, return all active habits.
  // In a real app, we'd filter by frequency config (e.g. only on Mon, Wed, Fri)
  return habitsList;
}

function calculateStreaks(logs: any[]) {
  if (logs.length === 0) return { currentStreak: 0, bestStreak: 0 };

  // Sort logs by date descending and remove duplicates for the same day
  const sortedUniqueLogs = Array.from(
    new Map(
      logs.map((log) => [startOfDay(log.completed_at).getTime(), log]),
    ).values(),
  ).sort((a, b) => b.completed_at.getTime() - a.completed_at.getTime());

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  // Calculate current streak
  const lastLogDate = startOfDay(sortedUniqueLogs[0].completed_at);

  if (isSameDay(lastLogDate, today) || isSameDay(lastLogDate, yesterday)) {
    let checkDate = lastLogDate;
    for (const log of sortedUniqueLogs) {
      if (isSameDay(startOfDay(log.completed_at), checkDate)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  // Calculate best streak
  let prevDate: Date | null = null;
  for (const log of sortedUniqueLogs) {
    const currentDate = startOfDay(log.completed_at);
    if (!prevDate || differenceInDays(prevDate, currentDate) === 1) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
    prevDate = currentDate;
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  return { currentStreak, bestStreak };
}
