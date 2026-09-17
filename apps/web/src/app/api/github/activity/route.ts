import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface GitHubCommit {
  message?: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: GitHubCommit[];
    action?: string;
    pull_request?: { title?: string };
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.githubAccessToken) {
    return NextResponse.json(
      { error: "Unauthorized or GitHub Not Connected" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${session.user.name}/events`,
      {
        headers: {
          Authorization: `Bearer ${session.user.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ activity: [] });
    }

    const events = (await response.json()) as GitHubEvent[];

    const pushEvents = events
      .filter((e) => e.type === "PushEvent")
      .slice(0, 10);
    const prEvents = events
      .filter((e) => e.type === "PullRequestEvent")
      .slice(0, 5);

    const activity = [
      ...pushEvents.map((e) => ({
        id: e.id,
        type: "commit" as const,
        repo: e.repo.name,
        message: e.payload.commits?.[0]?.message || "Pushed commits",
        timestamp: e.created_at,
        count: e.payload.commits?.length || 1,
      })),
      ...prEvents.map((e) => ({
        id: e.id,
        type: "pull_request" as const,
        repo: e.repo.name,
        message: e.payload.pull_request?.title,
        status: e.payload.action,
        timestamp: e.created_at,
      })),
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("GitHub activity error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
