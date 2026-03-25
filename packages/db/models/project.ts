import mongoose, { Schema, type Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  color: string;
  githubRepo?: string;
  githubRepoId?: number;
  githubRepoFullName?: string;
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: "#818cf8" },
    githubRepo: { type: String },
    githubRepoId: { type: Number },
    githubRepoFullName: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optional: index for performance
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ members: 1 });

export const ProjectModel = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
