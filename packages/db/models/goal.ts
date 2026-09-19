import mongoose, { Schema, type Document } from "mongoose";

export interface IGoal extends Document {
  title: string;
  description?: string;
  targetDate?: Date;
  projectId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: "open" | "met" | "failed";
  periodType?: "week" | "month" | "year";
  periodStart?: Date;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  isNorthStar?: boolean;
  /** Short slug used in commit messages: [fd:commitTag] */
  commitTag?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    title: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["open", "met", "failed"], default: "open" },
    periodType: { type: String, enum: ["week", "month", "year"] },
    periodStart: { type: Date },
    targetValue: { type: Number },
    currentValue: { type: Number },
    unit: { type: String },
    isNorthStar: { type: Boolean, default: false },
    commitTag: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1 });
GoalSchema.index({ projectId: 1 });
GoalSchema.index({ userId: 1, periodType: 1, periodStart: 1 });
GoalSchema.index({ userId: 1, commitTag: 1 });

export const GoalModel = mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
