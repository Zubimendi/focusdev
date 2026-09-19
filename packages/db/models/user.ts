import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreferences {
  theme?: "light" | "dark";
  timerDuration?: number;
  notificationSound?: string;
  weekStartsOn?: 0 | 1;
  notifyReviewDue?: boolean;
  notifyStreakRisk?: boolean;
  notifyGoalUpdates?: boolean;
  notifyHabitDue?: boolean;
  notifySecurity?: boolean;
}

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  name?: string;
  role: string;
  image?: string;
  githubAccessToken?: string;
  githubTokenExpiry?: Date;
  /** GitHub login (not display name) for API calls */
  githubUsername?: string;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodesHash?: string[];
  onboardingCompletedAt?: Date;
  preferences?: IUserPreferences;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    image: { type: String },
    password: { type: String, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    githubAccessToken: { type: String, select: false },
    githubTokenExpiry: { type: Date },
    githubUsername: { type: String, trim: true, lowercase: true },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    backupCodesHash: { type: [String], select: false, default: [] },
    onboardingCompletedAt: { type: Date },
    preferences: {
      theme: { type: String, enum: ["light", "dark"] },
      timerDuration: { type: Number },
      notificationSound: { type: String },
      weekStartsOn: { type: Number },
      notifyReviewDue: { type: Boolean, default: true },
      notifyStreakRisk: { type: Boolean, default: true },
      notifyGoalUpdates: { type: Boolean, default: true },
      notifyHabitDue: { type: Boolean, default: true },
      notifySecurity: { type: Boolean, default: true },
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toJSON", {
  virtuals: true,
});

export const UserModel =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
