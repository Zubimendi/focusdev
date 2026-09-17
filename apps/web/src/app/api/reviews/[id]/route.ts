import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { ReviewModel, GoalModel } from "@focus/db/models";
import { ReviewReflectionSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const review = await ReviewModel.findOne({
      _id: params.id,
      userId: user.id,
    });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      review: { ...review.toObject(), id: String(review._id) },
    });
  } catch (error) {
    console.error("Review GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = ReviewReflectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const review = await ReviewModel.findOne({
      _id: params.id,
      userId: user.id,
    });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const data = validation.data;
    if (data.wins !== undefined) review.wins = data.wins;
    if (data.blockers !== undefined) review.blockers = data.blockers;
    if (data.nextPeriodGoals !== undefined) {
      review.nextPeriodGoals = data.nextPeriodGoals;
    }

    if (data.goalScores) {
      review.goalScores = data.goalScores.map(
        (gs: { goalId: string; status: "open" | "met" | "failed"; score?: number }) => ({
          goalId: gs.goalId as unknown as typeof review.goalScores[0]["goalId"],
          status: gs.status,
          score: gs.score,
        })
      );

      // Sync goal statuses
      await Promise.all(
        data.goalScores.map(
          (gs: { goalId: string; status: "open" | "met" | "failed" }) =>
            GoalModel.findOneAndUpdate(
              { _id: gs.goalId, userId: user.id },
              { status: gs.status }
            )
        )
      );
    }

    await review.save();

    return NextResponse.json({
      review: { ...review.toObject(), id: String(review._id) },
    });
  } catch (error) {
    console.error("Review PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
