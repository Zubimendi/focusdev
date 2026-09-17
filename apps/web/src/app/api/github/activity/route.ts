import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.githubAccessToken) {
    return NextResponse.json({ error: "Unauthorized or GitHub Not Connected" }, { status: 401 });
  }

  try {
    // 1. Fetch user's recent activity (events) from GitHub
    // Events API is better for a summary of what they've been doing
    const response = await fetch(`https://api.github.com/users/${session.user.name}/events`, {
      headers: {
        Authorization: `Bearer ${session.user.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      // Fallback to just repos if events fail or for alternative data
      return NextResponse.json({ activity: [] });
    }

    const events = await response.json();
    
    // Filter for PushEvents and PullRequestEvents
    const pushEvents = events.filter((e: any) => e.type === "PushEvent").slice(0, 10);
    const prEvents = events.filter((e: any) => e.type === "PullRequestEvent").slice(0, 5);

    const activity = [
      ...pushEvents.map((e: any) => ({
        id: e.id,
        type: "commit",
        repo: e.repo.name,
        message: e.payload.commits?.[0]?.message || "Pushed commits",
        timestamp: e.created_at,
        count: e.payload.commits?.length || 1,
      })),
      ...prEvents.map((e: any) => ({
        id: e.id,
        type: "pull_request",
        repo: e.repo.name,
        message: e.payload.pull_request?.title,
        status: e.payload.action,
        timestamp: e.created_at,
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("GitHub activity error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
