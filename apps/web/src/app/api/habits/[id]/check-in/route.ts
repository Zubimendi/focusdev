import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { HabitModel, HabitCheckInModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const date =
      typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
        ? body.date
        : new Date().toISOString().slice(0, 10);

    await connectToDatabase();
    const habit = await HabitModel.findOne({ _id: params.id, userId });
    if (!habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existing = await HabitCheckInModel.findOne({
      habitId: habit._id,
      date,
    });
    const nextValue =
      typeof body.value === "number"
        ? Math.max(0, Math.min(100, body.value))
        : Math.min(habit.targetPerPeriod, (existing?.value || 0) + 1);

    const checkIn = await HabitCheckInModel.findOneAndUpdate(
      { habitId: habit._id, date },
      { $set: { userId, value: nextValue } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      checkIn: {
        habitId: habit._id.toString(),
        date: checkIn.date,
        value: checkIn.value,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("[habits check-in]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
