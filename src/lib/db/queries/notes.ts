import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export async function getNotesByProject(projectId: string) {
  return await db.query.notes.findMany({
    where: eq(notes.project_id, projectId),
    orderBy: [desc(notes.is_pinned), desc(notes.updated_at)],
  });
}
