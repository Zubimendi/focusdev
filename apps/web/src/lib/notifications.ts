import { connectToDatabase } from "@focus/db";
import {
  NotificationModel,
  UserModel,
  type NotificationType,
} from "@focus/db/models";

type PrefKey =
  | "notifyReviewDue"
  | "notifyStreakRisk"
  | "notifyGoalUpdates"
  | "notifyHabitDue"
  | "notifySecurity";

const typeToPref: Partial<Record<NotificationType, PrefKey>> = {
  review_due: "notifyReviewDue",
  streak_risk: "notifyStreakRisk",
  goal_update: "notifyGoalUpdates",
  habit_due: "notifyHabitDue",
  security: "notifySecurity",
};

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  try {
    await connectToDatabase();
    const user = await UserModel.findById(input.userId);
    if (!user) return null;

    const prefKey = typeToPref[input.type];
    if (prefKey && user.preferences?.[prefKey] === false) {
      return null;
    }

    return NotificationModel.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    });
  } catch (err) {
    console.error("[notifications] create failed", err);
    return null;
  }
}
