import { Schema, model, models, Document } from "mongoose";

export interface IFocusSessionDocument extends Document {
  taskId?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
}

const FocusSessionSchema = new Schema<IFocusSessionDocument>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export const FocusSessionModel = models.FocusSession || model<IFocusSessionDocument>("FocusSession", FocusSessionSchema);
