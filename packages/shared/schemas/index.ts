import { z } from "zod";
export * from "./user";
export * from "./focus";

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  color: z.string().default("#818cf8"),
  status: z.enum(["active", "paused", "archived"]).default("active"),
  githubRepo: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
  githubRepo: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const GoalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  projectId: z.string().optional(),
  status: z.enum(["open", "met", "failed"]).default("open"),
  periodType: z.enum(["week", "month", "year"]).optional(),
  periodStart: z.string().optional(),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  unit: z.string().optional(),
});

export const ReviewReflectionSchema = z.object({
  wins: z.string().optional(),
  blockers: z.string().optional(),
  nextPeriodGoals: z.string().optional(),
  goalScores: z
    .array(
      z.object({
        goalId: z.string(),
        status: z.enum(["open", "met", "failed"]),
        score: z.number().min(0).max(100).optional(),
      })
    )
    .optional(),
});

export const ReviewCreateSchema = z.object({
  periodType: z.enum(["week", "month", "year"]).default("week"),
  periodStart: z.string().optional(),
});
