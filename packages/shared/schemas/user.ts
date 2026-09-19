import { z } from "zod";

/** Strong password: min 10, upper, lower, number, special */
export const PasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a special character");

export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2).optional(),
  image: z.string().url().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  totpCode: z.string().length(6).optional(),
  backupCode: z.string().min(8).max(16).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  name: z.string().min(2),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(20),
  password: PasswordSchema,
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: PasswordSchema,
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const TotpCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const Disable2FASchema = z.object({
  password: z.string().min(1),
  code: z.string().min(6).optional(),
});

export const UserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  timerDuration: z.number().min(5).max(120).optional(),
  notificationSound: z.string().optional(),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]).optional(),
  notifyReviewDue: z.boolean().optional(),
  notifyStreakRisk: z.boolean().optional(),
  notifyGoalUpdates: z.boolean().optional(),
  notifyHabitDue: z.boolean().optional(),
  notifySecurity: z.boolean().optional(),
  showCharts: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
