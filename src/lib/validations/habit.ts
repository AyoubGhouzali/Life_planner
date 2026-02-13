import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  areaId: z.string().uuid().optional().nullable(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  frequencyConfig: z.any().optional(), // Could be days of week or other config
  targetCount: z.number().min(1),
});

export const habitLogSchema = z.object({
  habitId: z.string().uuid(),
  completedAt: z.date().optional(),
  value: z.number().min(1).default(1),
  note: z.string().optional(),
});
