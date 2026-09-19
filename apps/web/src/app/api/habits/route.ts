import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { HabitModel, HabitCheckInModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const habits = await HabitModel.find({ userId, active: true }).sort({
      createdAt: -1,
    });
    const date = todayKey();
    const checkIns = await HabitCheckInModel.find({
      userId,
      date,
      habitId: { $in: habits.map((h) => h._id) },
    });

    const byHabit = new Map(
      checkIns.map((c) => [String(c.habitId), c.value])
    );

    return NextResponse.json({
      habits: habits.map((h) => ({
        id: h._id.toString(),
        title: h.title,
        description: h.description,
        cadence: h.cadence,
        targetPerPeriod: h.targetPerPeriod,
        unit: h.unit,
        projectId: h.projectId ? String(h.projectId) : undefined,
        todayValue: byHabit.get(h._id.toString()) || 0,
      })),
      date,
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[habits GET]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const cadence = body.cadence === "weekly" ? "weekly" : "daily";
    const targetPerPeriod = Math.max(
      1,
      Math.min(100, Number(body.targetPerPeriod) || 1)
    );

    await connectToDatabase();
    const habit = await HabitModel.create({
      userId,
      title,
      description:
        typeof body.description === "string" ? body.description : undefined,
      cadence,
      targetPerPeriod,
      unit: typeof body.unit === "string" ? body.unit : undefined,
      projectId: body.projectId || undefined,
    });

    return NextResponse.json(
      {
        habit: {
          id: habit._id.toString(),
          title: habit.title,
          cadence: habit.cadence,
          targetPerPeriod: habit.targetPerPeriod,
          todayValue: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[habits POST]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
