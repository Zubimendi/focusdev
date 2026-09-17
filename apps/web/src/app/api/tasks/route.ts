import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { TaskModel } from "@focus/db/models";
import { TaskSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const query: Record<string, unknown> = { userId: user.id };
    if (projectId) query.projectId = projectId;

    const tasks = await TaskModel.find(query).sort({ createdAt: -1 });
    return NextResponse.json(
      {
        tasks: tasks.map((t) => ({ ...t.toObject(), id: String(t._id) })),
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
    const validation = TaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 });
    }

    await connectToDatabase();
    const task = await TaskModel.create({
      ...validation.data,
      userId: user.id,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

