import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { FocusSessionModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notes } = await req.json();
    const sessionId = params.id;

    await connectToDatabase();
    const session = await FocusSessionModel.findOne({ _id: sessionId, userId: user.id });
    
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.endTime) {
      return NextResponse.json({ error: "Session already ended" }, { status: 400 });
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / 60000);

    session.endTime = endTime;
    session.duration = duration;
    if (notes) session.notes = notes;
    
    await session.save();

    return NextResponse.json({ session }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

