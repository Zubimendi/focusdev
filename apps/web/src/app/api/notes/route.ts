import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { NoteModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";

export async function GET(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    await connectToDatabase();
    const filter: Record<string, unknown> = { userId };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } },
      ];
    }

    const notes = await NoteModel.find(filter).sort({ updatedAt: -1 }).limit(100);
    return NextResponse.json({
      notes: notes.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        body: n.body,
        projectId: n.projectId ? String(n.projectId) : undefined,
        goalId: n.goalId ? String(n.goalId) : undefined,
        updatedAt: n.updatedAt,
        createdAt: n.createdAt,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[notes GET]", error.message);
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
    if (!title || title.length > 200) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const note = await NoteModel.create({
      userId,
      title,
      body: typeof body.body === "string" ? body.body.slice(0, 20000) : "",
      projectId: body.projectId || undefined,
      goalId: body.goalId || undefined,
    });

    return NextResponse.json(
      {
        note: {
          id: note._id.toString(),
          title: note.title,
          body: note.body,
          updatedAt: note.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[notes POST]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
