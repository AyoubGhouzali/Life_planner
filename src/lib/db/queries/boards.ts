import { db } from "@/lib/db";
import { boards, columns, projects, tasks, notes } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";

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
              tasks: {
                orderBy: [asc(tasks.position)],
              },
              notes: {
                orderBy: [desc(notes.is_pinned), desc(notes.updated_at)],
              },
            },
          },
        },
      },
    },
  });
}
