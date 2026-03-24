import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { FocusSessionModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const sessions = await FocusSessionModel.find({ userId: user.id }).sort({ startTime: -1 });
    return NextResponse.json({ sessions }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

