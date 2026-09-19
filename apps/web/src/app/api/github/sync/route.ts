import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { getAuthenticatedUser } from "@/lib/auth-middleware";
import { syncGithubGoalContributions } from "@/lib/github-sync";

export const dynamic = "force-dynamic";

/**
 * Sync GitHub commits into goal contributions.
 * Body (optional): { projectId?: string }
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const projectId =
      typeof body.projectId === "string" ? body.projectId : undefined;

    await connectToDatabase();
    const result = await syncGithubGoalContributions({
      userId: user.id,
      projectId,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[github/sync]", error);
    return NextResponse.json(
      { error: "Failed to sync GitHub contributions." },
      { status: 500 }
    );
  }
}
