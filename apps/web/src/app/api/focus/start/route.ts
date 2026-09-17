import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { FocusSessionModel, TaskModel } from "@focus/db/models";
import { FocusSessionSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = FocusSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let projectId = validation.data.projectId;
    const taskId = validation.data.taskId;

    if (taskId && !projectId) {
      const task = await TaskModel.findOne({ _id: taskId, userId: user.id });
      if (task?.projectId) {
        projectId = String(task.projectId);
      }
    }

    const session = await FocusSessionModel.create({
      taskId: taskId || undefined,
      projectId: projectId || undefined,
      notes: validation.data.notes,
      userId: user.id,
      startTime: new Date(),
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Focus start error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
