import { z } from "zod";

export const timeEntrySchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  startTime: z.date(),
  endTime: z.date().optional().nullable(),
  description: z.string().optional().nullable(),
});
