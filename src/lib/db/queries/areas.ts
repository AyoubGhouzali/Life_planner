import { db } from "@/lib/db";
import { lifeAreas, boards } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function getAreas(userId: string) {
  return await db.query.lifeAreas.findMany({
    where: and(
      eq(lifeAreas.user_id, userId),
      eq(lifeAreas.is_archived, false)
    ),
    orderBy: [asc(lifeAreas.position)],
    with: {
      boards: {
        with: {
          columns: {
            with: {
              projects: true,
            },
          },
        },
      },
    },
  });
}

export async function getAreaById(areaId: string, userId: string) {
  return await db.query.lifeAreas.findFirst({
    where: and(
      eq(lifeAreas.id, areaId),
      eq(lifeAreas.user_id, userId)
    ),
    with: {
      boards: {
        orderBy: [asc(boards.position)],
      },
    },
  });
}
