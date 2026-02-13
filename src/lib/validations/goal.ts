import { z } from "zod";

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetDate: z.string().optional().nullable(),
  targetValue: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
});
