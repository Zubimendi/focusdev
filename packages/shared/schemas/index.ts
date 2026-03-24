export * from "./user";
export * from "./focus";

export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  goalId: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  color: z.string().default("#818cf8"),
  githubRepo: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const GoalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  projectId: z.string().optional(),
  status: z.enum(["open", "met", "failed"]).default("open"),
});
