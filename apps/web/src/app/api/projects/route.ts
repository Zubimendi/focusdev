import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { ProjectModel, TaskModel, FocusSessionModel } from "@focus/db/models";
import { ProjectSchema } from "@focus/shared";
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

async function enrichProjects(
  projects: InstanceType<typeof ProjectModel>[],
  userId: string
) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const projectIds = projects.map((p) => p._id);

  const [tasks, sessions] = await Promise.all([
    TaskModel.find({ userId, projectId: { $in: projectIds } }).select(
      "projectId status"
    ),
    FocusSessionModel.find({
      userId,
      projectId: { $in: projectIds },
      startTime: { $gte: weekStart, $lte: weekEnd },
    }).select("projectId startTime endTime duration"),
  ]);

  return projects.map((p) => {
    const pid = String(p._id);
    const projectTasks = tasks.filter((t) => String(t.projectId) === pid);
    const taskCounts = {
      todo: projectTasks.filter((t) => t.status === "todo").length,
      in_progress: projectTasks.filter((t) => t.status === "in_progress").length,
      done: projectTasks.filter((t) => t.status === "done").length,
      total: projectTasks.length,
    };
    const focusMinutes = Math.round(
      sessions
        .filter((s) => String(s.projectId) === pid)
        .reduce((acc, s) => acc + sessionMinutes(s), 0)
    );
    return {
      ...p.toObject(),
      id: pid,
      taskCounts,
      focusMinutes,
    };
  });
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    await connectToDatabase();
    const query: Record<string, unknown> = {
      $or: [{ ownerId: user.id }, { members: user.id }],
    };
    if (status && ["active", "paused", "archived"].includes(status)) {
      if (status === "active") {
        query.$and = [
          {
            $or: [
              { status: "active" },
              { status: { $exists: false } },
              { status: null },
            ],
          },
        ];
      } else {
        query.status = status;
      }
    }

    const projects = await ProjectModel.find(query).sort({ updatedAt: -1 });
    const enriched = await enrichProjects(projects, user.id);

    return NextResponse.json({ projects: enriched }, { status: 200 });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = ProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const project = await ProjectModel.create({
      ...validation.data,
      ownerId: user.id,
      members: [user.id],
    });

    return NextResponse.json(
      {
        project: {
          ...project.toObject(),
          id: String(project._id),
          taskCounts: { todo: 0, in_progress: 0, done: 0, total: 0 },
          focusMinutes: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Projects POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
