import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { GoalModel } from "@focus/db/models";
import { GoalSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";
import {
  slugifyCommitTag,
  uniqueCommitTag,
} from "@/lib/github-goal-tags";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get("periodType");
    const projectId = searchParams.get("projectId");
    const query: Record<string, unknown> = { userId: user.id };
    if (periodType) query.periodType = periodType;
    if (projectId) query.projectId = projectId;

    const goals = await GoalModel.find(query).sort({ targetDate: 1 });

    return NextResponse.json(
      {
        goals: goals.map((g) => ({ ...g.toObject(), id: String(g._id) })),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = GoalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 });
    }

    await connectToDatabase();
    const data = validation.data;

    const existingTags = (
      await GoalModel.find({ userId: user.id, commitTag: { $exists: true } }).select(
        "commitTag"
      )
    )
      .map((g) => g.commitTag)
      .filter(Boolean) as string[];

    const rawTag =
      data.commitTag ||
      (data.projectId ? slugifyCommitTag(data.title) : undefined);
    const commitTag = rawTag
      ? uniqueCommitTag(rawTag, existingTags)
      : undefined;

    const goal = await GoalModel.create({
      ...data,
      commitTag,
      userId: user.id,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      periodStart: data.periodStart ? new Date(data.periodStart) : undefined,
      unit: data.unit || (commitTag ? "commits" : undefined),
      currentValue: data.currentValue ?? 0,
    });

    return NextResponse.json(
      { goal: { ...goal.toObject(), id: String(goal._id) } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
