import { NextResponse } from "next/server";
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
  GitContributionModel,
} from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";

export async function GET(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const [
      user,
      projects,
      tasks,
      sessions,
      goals,
      reviews,
      notes,
      habits,
      checkIns,
      contributions,
    ] = await Promise.all([
      UserModel.findById(userId).select("-password -twoFactorSecret -backupCodesHash -passwordResetTokenHash -githubAccessToken"),
      ProjectModel.find({ ownerId: userId }),
      TaskModel.find({ userId }),
      FocusSessionModel.find({ userId }),
      GoalModel.find({ userId }),
      ReviewModel.find({ userId }),
      NoteModel.find({ userId }),
      HabitModel.find({ userId }),
      HabitCheckInModel.find({ userId }),
      GitContributionModel.find({ userId }),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      projects,
      tasks,
      sessions,
      goals,
      reviews,
      notes,
      habits,
      habitCheckIns: checkIns,
      gitContributions: contributions,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="focusdev-export-${Date.now()}.json"`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[export]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
