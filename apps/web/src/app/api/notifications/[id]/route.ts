import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { NotificationModel } from "@focus/db/models";
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

    await connectToDatabase();
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      notification: {
        id: notification._id.toString(),
        readAt: notification.readAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("[notifications/[id]]", error.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
