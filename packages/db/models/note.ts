import mongoose, { Schema, type Document } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  projectId?: mongoose.Types.ObjectId;
  goalId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal" },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, updatedAt: -1 });

export const NoteModel =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
