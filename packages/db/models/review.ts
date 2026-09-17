import mongoose, { Schema, type Document } from "mongoose";

export interface IReviewProjectBreakdown {
  projectId: mongoose.Types.ObjectId;
  focusMinutes: number;
  tasksDone: number;
}

export interface IReviewGoalScore {
  goalId: mongoose.Types.ObjectId;
  status: "open" | "met" | "failed";
  score?: number;
}

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  periodType: "week" | "month" | "year";
  periodStart: Date;
  periodEnd: Date;
  focusMinutes: number;
  sessionCount: number;
  tasksDone: number;
  streak: number;
  byProject: IReviewProjectBreakdown[];
  githubPushes?: number;
  githubPullRequests?: number;
  wins?: string;
  blockers?: string;
  nextPeriodGoals?: string;
  goalScores: IReviewGoalScore[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    periodType: {
      type: String,
      enum: ["week", "month", "year"],
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    focusMinutes: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 },
    tasksDone: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    byProject: [
      {
        projectId: { type: Schema.Types.ObjectId, ref: "Project" },
        focusMinutes: { type: Number, default: 0 },
        tasksDone: { type: Number, default: 0 },
      },
    ],
    githubPushes: { type: Number },
    githubPullRequests: { type: Number },
    wins: { type: String },
    blockers: { type: String },
    nextPeriodGoals: { type: String },
    goalScores: [
      {
        goalId: { type: Schema.Types.ObjectId, ref: "Goal" },
        status: {
          type: String,
          enum: ["open", "met", "failed"],
          default: "open",
        },
        score: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

ReviewSchema.index(
  { userId: 1, periodType: 1, periodStart: 1 },
  { unique: true }
);

export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
