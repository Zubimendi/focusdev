import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { NotificationModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";

export async function GET(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await NotificationModel.countDocuments({
      userId,
      readAt: { $exists: false },
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: String(n._id),
        type: n.type,
        title: n.title,
        body: n.body,
        href: n.href,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[notifications]", error.message);
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

    const body = await req.json().catch(() => ({}));
    if (body?.action !== "read-all") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectToDatabase();
    await NotificationModel.updateMany(
      { userId, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );

    return NextResponse.json({ message: "All marked as read" });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("[notifications read-all]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
