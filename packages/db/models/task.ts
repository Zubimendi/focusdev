import { Schema, model, models, Document } from "mongoose";

export interface ITaskDocument extends Document {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  userId: Schema.Types.ObjectId;
  projectId?: Schema.Types.ObjectId;
  goalId?: Schema.Types.ObjectId;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal" },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ goalId: 1 });

export const TaskModel = models.Task || model<ITaskDocument>("Task", TaskSchema);
