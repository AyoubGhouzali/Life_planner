import { db } from "@/lib/db";
import { goals, goalProjects, projects, tasks } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getGoals(userId: string) {
  const userGoals = await db.query.goals.findMany({
    where: and(
        eq(goals.user_id, userId),
        eq(goals.is_archived, false)
    ),
    orderBy: [desc(goals.created_at)],
    with: {
        goalProjects: {
            with: {
                project: {
                    with: {
                        tasks: true
                    }
                }
            }
        }
    }
  });

  return userGoals.map(goal => {
    // Calculate progress based on linked projects and their tasks
    const linkedProjects = goal.goalProjects.map(gp => gp.project);
    let totalTasks = 0;
    let completedTasks = 0;

    linkedProjects.forEach(project => {
        totalTasks += project.tasks.length;
        completedTasks += project.tasks.filter(t => t.status === 'done').length;
    });

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
        ...goal,
        totalTasks,
        completedTasks,
        progress: Math.round(progress)
    };
  });
}

export async function getGoalById(goalId: string, userId: string) {
    return await db.query.goals.findFirst({
        where: and(
            eq(goals.id, goalId),
            eq(goals.user_id, userId)
        ),
        with: {
            goalProjects: {
                with: {
                    project: {
                        with: {
                            tasks: true
                        }
                    }
                }
            }
        }
    });
}
