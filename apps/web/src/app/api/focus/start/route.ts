import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { FocusSessionModel } from "@focus/db/models";
import { FocusSessionSchema } from "@focus/shared";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = FocusSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 });
    }

    await connectToDatabase();
    const session = await FocusSessionModel.create({
      ...validation.data,
      userId: user.id,
      startTime: new Date(),
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
