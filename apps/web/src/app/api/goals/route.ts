import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { GoalModel } from "@focus/db/models";
import { GoalSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const goals = await GoalModel.find({ userId: user.id }).sort({ targetDate: 1 });
    
    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
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
    const goal = await GoalModel.create({
      ...validation.data,
      userId: user.id,
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
