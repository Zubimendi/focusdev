import mongoose, { Schema, type Document } from "mongoose";

export interface IGoal extends Document {
  title: string;
  description?: string;
  targetDate?: Date;
  projectId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: "open" | "met" | "failed";
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
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1 });
GoalSchema.index({ projectId: 1 });

export const GoalModel = mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
