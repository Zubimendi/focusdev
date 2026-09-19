import mongoose, { Schema, type Document } from "mongoose";

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  cadence: "daily" | "weekly";
  targetPerPeriod: number;
  unit?: string;
  projectId?: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    cadence: { type: String, enum: ["daily", "weekly"], default: "daily" },
    targetPerPeriod: { type: Number, default: 1, min: 1 },
    unit: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1, active: 1 });

export const HabitModel =
  mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export interface IHabitCheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

const HabitCheckInSchema = new Schema<IHabitCheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true },
    date: { type: String, required: true },
    value: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
);

HabitCheckInSchema.index({ habitId: 1, date: 1 }, { unique: true });
HabitCheckInSchema.index({ userId: 1, date: 1 });

export const HabitCheckInModel =
  mongoose.models.HabitCheckIn ||
  mongoose.model<IHabitCheckIn>("HabitCheckIn", HabitCheckInSchema);
