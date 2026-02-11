import { z } from "zod";

export const columnSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional().nullable(),
  boardId: z.string().uuid("Invalid board ID"),
  wipLimit: z.number().int().min(0).optional().nullable(),
});

export type ColumnInput = z.infer<typeof columnSchema>;
