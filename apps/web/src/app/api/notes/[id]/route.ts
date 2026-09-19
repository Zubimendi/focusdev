import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { NoteModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) {
      update.title = body.title.trim().slice(0, 200);
    }
    if (typeof body.body === "string") {
      update.body = body.body.slice(0, 20000);
    }

    await connectToDatabase();
    const note = await NoteModel.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: update },
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      note: {
        id: note._id.toString(),
        title: note.title,
        body: note.body,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[notes PATCH]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

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
    const result = await NoteModel.deleteOne({ _id: params.id, userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted" });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[notes DELETE]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
