import { z } from "zod";

export const boardSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200).optional(),
  areaId: z.string().uuid("Invalid area ID"),
});

export type BoardInput = z.infer<typeof boardSchema>;
