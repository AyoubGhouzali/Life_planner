import { db } from "@/lib/db";
import { boards, columns, projects, tasks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getBoardWithData(boardId: string) {
  return await db.query.boards.findFirst({
    where: eq(boards.id, boardId),
    with: {
      columns: {
        orderBy: [asc(columns.position)],
        with: {
          projects: {
            orderBy: [asc(projects.position)],
            where: eq(projects.is_archived, false),
            with: {
              tasks: true,
            },
          },
        },
      },
    },
  });
}
