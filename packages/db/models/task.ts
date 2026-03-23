import { Schema, model, models, Document } from "mongoose";

export interface ITaskDocument extends Document {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  userId: Schema.Types.ObjectId;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const TaskModel = models.Task || model<ITaskDocument>("Task", TaskSchema);
