import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { GitContributionModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const goalId = searchParams.get("goalId");
    const limit = Math.min(
      Number(searchParams.get("limit") || 40) || 40,
      100
    );

    const query: Record<string, unknown> = { userId: user.id };
    if (projectId) query.projectId = projectId;
    if (goalId) query.goalId = goalId;

    const contributions = await GitContributionModel.find(query)
      .sort({ committedAt: -1 })
      .limit(limit);

    return NextResponse.json({
      contributions: contributions.map((c) => ({
        ...c.toObject(),
        id: String(c._id),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load contributions." },
      { status: 500 }
    );
  }
}
