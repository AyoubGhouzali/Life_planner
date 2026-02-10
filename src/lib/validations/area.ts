import { z } from "zod";

export const areaSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
  description: z.string().max(200).optional(),
});

export type AreaInput = z.infer<typeof areaSchema>;
