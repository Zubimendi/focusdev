import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().datetime().optional(),
});

export const FocusSessionSchema = z.object({
  taskId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().min(0).optional(), // in minutes
  notes: z.string().max(1000).optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;
export type FocusSessionInput = z.infer<typeof FocusSessionSchema>;
