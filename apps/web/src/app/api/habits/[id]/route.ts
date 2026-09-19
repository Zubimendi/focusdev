import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { HabitModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const habit = await HabitModel.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: { active: false } },
      { new: true }
    );
    if (!habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Archived" });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[habits DELETE]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
