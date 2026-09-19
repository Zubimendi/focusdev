import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@focus/db";
import {
  UserModel,
  ProjectModel,
  TaskModel,
  FocusSessionModel,
  GoalModel,
  ReviewModel,
  NoteModel,
  HabitModel,
  HabitCheckInModel,
  NotificationModel,
  GitContributionModel,
} from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";
import { authRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const limited = authRateLimit(req, "delete-account");
    if (limited) return limited;

    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete your account." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId).select("+password");
    if (!user?.password) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Password is incorrect." },
        { status: 400 }
      );
    }

    await Promise.all([
      TaskModel.deleteMany({ userId }),
      FocusSessionModel.deleteMany({ userId }),
      GoalModel.deleteMany({ userId }),
      ReviewModel.deleteMany({ userId }),
      NoteModel.deleteMany({ userId }),
      HabitCheckInModel.deleteMany({ userId }),
      HabitModel.deleteMany({ userId }),
      NotificationModel.deleteMany({ userId }),
      GitContributionModel.deleteMany({ userId }),
      ProjectModel.deleteMany({ ownerId: userId }),
      UserModel.deleteOne({ _id: userId }),
    ]);

    return NextResponse.json({ message: "Account deleted." });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("[delete-account]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
