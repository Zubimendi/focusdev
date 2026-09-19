import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { GoalModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title.trim();
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.status === "string") update.status = body.status;
    if (typeof body.currentValue === "number") update.currentValue = body.currentValue;
    if (typeof body.targetValue === "number") update.targetValue = body.targetValue;
    if (typeof body.unit === "string") update.unit = body.unit;
    if (typeof body.isNorthStar === "boolean") update.isNorthStar = body.isNorthStar;
    if (typeof body.commitTag === "string") {
      const tag = body.commitTag
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 48);
      if (tag) update.commitTag = tag;
    }

    await connectToDatabase();

    if (body.isNorthStar === true) {
      await GoalModel.updateMany(
        { userId: user.id, isNorthStar: true },
        { $set: { isNorthStar: false } }
      );
    }

    if (typeof update.commitTag === "string") {
      const clash = await GoalModel.findOne({
        userId: user.id,
        commitTag: update.commitTag,
        _id: { $ne: params.id },
      });
      if (clash) {
        return NextResponse.json(
          { error: `Commit tag [fd:${update.commitTag}] is already used by another goal.` },
          { status: 409 }
        );
      }
    }

    const goal = await GoalModel.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: update },
      { new: true }
    );

    if (!goal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.status === "met" || body.status === "failed") {
      await createNotification({
        userId: user.id,
        type: "goal_update",
        title: body.status === "met" ? "Goal met" : "Goal missed",
        body: goal.title,
        href: "/reviews/week",
      });
    }

    return NextResponse.json({
      goal: { ...goal.toObject(), id: String(goal._id) },
    });
  } catch {
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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const result = await GoalModel.deleteOne({
      _id: params.id,
      userId: user.id,
    });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
