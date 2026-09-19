import mongoose, { Schema, type Document } from "mongoose";

/**
 * A GitHub commit (or PR) attributed to a FocusDev goal via structured message tags.
 * Convention: include [fd:commitTag] in the commit subject, e.g.
 *   [fd:career] Add JWT auth middleware
 */
export interface IGitContribution extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  goalId: mongoose.Types.ObjectId;
  repoFullName: string;
  sha: string;
  message: string;
  htmlUrl?: string;
  committedAt: Date;
  source: "push" | "pull_request";
  commitTag: string;
  createdAt: Date;
  updatedAt: Date;
}

const GitContributionSchema = new Schema<IGitContribution>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    repoFullName: { type: String, required: true },
    sha: { type: String, required: true },
    message: { type: String, required: true },
    htmlUrl: { type: String },
    committedAt: { type: Date, required: true },
    source: {
      type: String,
      enum: ["push", "pull_request"],
      default: "push",
    },
    commitTag: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

GitContributionSchema.index({ userId: 1, sha: 1 }, { unique: true });
GitContributionSchema.index({ goalId: 1, committedAt: -1 });
GitContributionSchema.index({ projectId: 1, committedAt: -1 });
GitContributionSchema.index({ commitTag: 1, userId: 1 });

export const GitContributionModel =
  mongoose.models.GitContribution ||
  mongoose.model<IGitContribution>("GitContribution", GitContributionSchema);
