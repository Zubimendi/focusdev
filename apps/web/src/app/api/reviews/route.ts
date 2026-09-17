import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import {
  ReviewModel,
  FocusSessionModel,
  TaskModel,
  GoalModel,
  ProjectModel,
} from "@focus/db/models";
import { ReviewCreateSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";
import mongoose from "mongoose";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  subDays,
  isSameDay,
  parseISO,
} from "date-fns";

type PeriodType = "week" | "month" | "year";

function sessionMinutes(s: {
  startTime: Date;
  endTime?: Date;
  duration?: number;
}) {
  if (typeof s.duration === "number" && s.duration > 0) return s.duration;
  if (s.endTime) {
    return Math.max(
      0,
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000
    );
  }
  return 0;
}

function getPeriodBounds(periodType: PeriodType, ref: Date) {
  if (periodType === "month") {
    return { start: startOfMonth(ref), end: endOfMonth(ref) };
  }
  if (periodType === "year") {
    return { start: startOfYear(ref), end: endOfYear(ref) };
  }
  return {
    start: startOfWeek(ref, { weekStartsOn: 1 }),
    end: endOfWeek(ref, { weekStartsOn: 1 }),
  };
}

async function computeSnapshot(userId: string, start: Date, end: Date) {
  const heatmapStart = subDays(startOfDay(new Date()), 49);

  const [sessions, periodSessions, tasksDone, goals] = await Promise.all([
    FocusSessionModel.find({
      userId,
      startTime: { $gte: heatmapStart },
    }),
    FocusSessionModel.find({
      userId,
      startTime: { $gte: start, $lte: end },
    }),
    TaskModel.countDocuments({
      userId,
      status: "done",
      updatedAt: { $gte: start, $lte: end },
    }),
    GoalModel.find({
      userId,
      $or: [
        { periodType: { $exists: false } },
        { periodType: null },
        {
          periodType: { $in: ["week", "month", "year"] },
          periodStart: { $gte: start, $lte: end },
        },
      ],
    }),
  ]);

  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    const date = subDays(startOfDay(now), i);
    const hasSession = sessions.some((s) =>
      isSameDay(new Date(s.startTime), date)
    );
    if (hasSession) streak++;
    else if (i === 0) continue;
    else break;
  }

  const focusMinutes = Math.round(
    periodSessions.reduce((acc, s) => acc + sessionMinutes(s), 0)
  );

  const projectFocus = new Map<string, number>();
  for (const s of periodSessions) {
    if (!s.projectId) continue;
    const pid = String(s.projectId);
    projectFocus.set(pid, (projectFocus.get(pid) || 0) + sessionMinutes(s));
  }

  const doneByProject = await TaskModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "done",
        updatedAt: { $gte: start, $lte: end },
        projectId: { $ne: null },
      },
    },
    { $group: { _id: "$projectId", count: { $sum: 1 } } },
  ]);
  const tasksByProject = new Map(
    doneByProject.map((r: { _id: unknown; count: number }) => [
      String(r._id),
      r.count,
    ])
  );

  const allProjectIds = Array.from(
    new Set([
      ...Array.from(projectFocus.keys()),
      ...Array.from(tasksByProject.keys()),
    ])
  );

  const byProject = allProjectIds.map((pid) => ({
    projectId: pid,
    focusMinutes: Math.round(projectFocus.get(pid) || 0),
    tasksDone: tasksByProject.get(pid) || 0,
  }));

  const periodGoals = goals.filter((g) => {
    if (!g.periodType) return true;
    if (!g.periodStart) return true;
    const ps = new Date(g.periodStart);
    return ps >= start && ps <= end;
  });

  return {
    focusMinutes,
    sessionCount: periodSessions.length,
    tasksDone,
    streak,
    byProject,
    goals: periodGoals.map((g) => ({
      ...g.toObject(),
      id: String(g._id),
    })),
  };
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const periodType = (searchParams.get("periodType") || "week") as PeriodType;
    const current = searchParams.get("current") === "true";

    await connectToDatabase();

    if (current) {
      const { start, end } = getPeriodBounds(periodType, new Date());
      let review = await ReviewModel.findOne({
        userId: user.id,
        periodType,
        periodStart: start,
      });

      const snapshot = await computeSnapshot(user.id, start, end);

      if (!review) {
        review = await ReviewModel.create({
          userId: user.id,
          periodType,
          periodStart: start,
          periodEnd: end,
          focusMinutes: snapshot.focusMinutes,
          sessionCount: snapshot.sessionCount,
          tasksDone: snapshot.tasksDone,
          streak: snapshot.streak,
          byProject: snapshot.byProject,
          goalScores: snapshot.goals.map((g: { id: string; status: string }) => ({
            goalId: g.id,
            status: g.status,
          })),
        });
      } else {
        review.focusMinutes = snapshot.focusMinutes;
        review.sessionCount = snapshot.sessionCount;
        review.tasksDone = snapshot.tasksDone;
        review.streak = snapshot.streak;
        review.byProject = snapshot.byProject as typeof review.byProject;
        await review.save();
      }

      const projectIds = snapshot.byProject.map((p) => p.projectId);
      const projects = projectIds.length
        ? await ProjectModel.find({ _id: { $in: projectIds } }).select(
            "name color"
          )
        : [];
      const projectMap = new Map(
        projects.map((p) => [String(p._id), { name: p.name, color: p.color }])
      );

      return NextResponse.json({
        review: {
          ...review.toObject(),
          id: String(review._id),
          byProject: snapshot.byProject.map((p) => ({
            ...p,
            name: projectMap.get(p.projectId)?.name || "Unknown",
            color: projectMap.get(p.projectId)?.color || "#2d6a5e",
          })),
        },
        goals: snapshot.goals,
        period: { start: start.toISOString(), end: end.toISOString() },
      });
    }

    const reviews = await ReviewModel.find({ userId: user.id, periodType })
      .sort({ periodStart: -1 })
      .limit(52);

    return NextResponse.json({
      reviews: reviews.map((r) => ({ ...r.toObject(), id: String(r._id) })),
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = ReviewCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const periodType = validation.data.periodType as PeriodType;
    const ref = validation.data.periodStart
      ? parseISO(validation.data.periodStart)
      : new Date();
    const { start, end } = getPeriodBounds(periodType, ref);

    await connectToDatabase();

    const existing = await ReviewModel.findOne({
      userId: user.id,
      periodType,
      periodStart: start,
    });
    if (existing) {
      return NextResponse.json({
        review: { ...existing.toObject(), id: String(existing._id) },
      });
    }

    const snapshot = await computeSnapshot(user.id, start, end);
    const review = await ReviewModel.create({
      userId: user.id,
      periodType,
      periodStart: start,
      periodEnd: end,
      focusMinutes: snapshot.focusMinutes,
      sessionCount: snapshot.sessionCount,
      tasksDone: snapshot.tasksDone,
      streak: snapshot.streak,
      byProject: snapshot.byProject,
      goalScores: snapshot.goals.map((g: { id: string; status: string }) => ({
        goalId: g.id,
        status: g.status,
      })),
    });

    return NextResponse.json(
      { review: { ...review.toObject(), id: String(review._id) } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
