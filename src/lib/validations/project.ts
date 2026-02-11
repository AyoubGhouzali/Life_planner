import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().datetime().optional().nullable(),
  columnId: z.string().uuid("Invalid column ID"),
  isProcess: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
