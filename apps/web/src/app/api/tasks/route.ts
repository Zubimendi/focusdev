import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { TaskModel } from "@focus/db/models";
import { TaskSchema } from "@focus/shared";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const tasks = await TaskModel.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
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
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
