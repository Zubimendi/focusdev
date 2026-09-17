import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { ProjectModel, TaskModel, FocusSessionModel, GoalModel } from "@focus/db/models";
import { ProjectUpdateSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";
import { startOfWeek, endOfWeek } from "date-fns";

function sessionMinutes(s: { startTime: Date; endTime?: Date; duration?: number }) {
  if (typeof s.duration === "number" && s.duration > 0) return s.duration;
  if (s.endTime) {
    return Math.max(
      0,
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000
    );
  }
  return 0;
}

async function canAccessProject(projectId: string, userId: string) {
  return ProjectModel.findOne({
    _id: projectId,
    $or: [{ ownerId: userId }, { members: userId }],
  });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const project = await canAccessProject(params.id, user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const [tasks, goals, weekSessions, allSessions] = await Promise.all([
      TaskModel.find({ userId: user.id, projectId: params.id }).sort({
        updatedAt: -1,
      }),
      GoalModel.find({ userId: user.id, projectId: params.id }).sort({
        targetDate: 1,
      }),
      FocusSessionModel.find({
        userId: user.id,
        projectId: params.id,
        startTime: { $gte: weekStart, $lte: weekEnd },
      }),
      FocusSessionModel.find({
        userId: user.id,
        projectId: params.id,
      }).select("startTime endTime duration"),
    ]);

    const taskCounts = {
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      total: tasks.length,
    };

    const focusMinutesWeek = Math.round(
      weekSessions.reduce((acc, s) => acc + sessionMinutes(s), 0)
    );
    const focusMinutesAll = Math.round(
      allSessions.reduce((acc, s) => acc + sessionMinutes(s), 0)
    );

    return NextResponse.json({
      project: {
        ...project.toObject(),
        id: String(project._id),
        taskCounts,
        focusMinutes: focusMinutesWeek,
        focusMinutesAll,
      },
      tasks: tasks.map((t) => ({ ...t.toObject(), id: String(t._id) })),
      goals: goals.map((g) => ({ ...g.toObject(), id: String(g._id) })),
    });
  } catch (error) {
    console.error("Project GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = ProjectUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const project = await canAccessProject(params.id, user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    Object.assign(project, validation.data);
    await project.save();

    return NextResponse.json({
      project: { ...project.toObject(), id: String(project._id) },
    });
  } catch (error) {
    console.error("Project PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
