import { z } from "zod";

export const noteSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});
