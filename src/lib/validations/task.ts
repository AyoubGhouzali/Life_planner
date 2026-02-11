import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  projectId: z.string().uuid("Invalid project ID"),
  parentTaskId: z.string().uuid().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().datetime().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;
