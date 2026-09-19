import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { GitContributionModel, UserModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";
import { parseCommitTag } from "@/lib/github-goal-tags";

export const dynamic = "force-dynamic";

interface GitHubCommit {
  sha?: string;
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
    pull_request?: { title?: string; html_url?: string };
  };
}

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const dbUser = await UserModel.findById(user.id).select(
      "+githubAccessToken githubUsername"
    );

    if (!dbUser?.githubAccessToken) {
      return NextResponse.json(
        { error: "GitHub not connected", activity: [] },
        { status: 401 }
      );
    }

    let login = dbUser.githubUsername;
    if (!login) {
      const meRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${dbUser.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (meRes.ok) {
        const me = (await meRes.json()) as { login?: string };
        login = me.login;
        if (login) {
          dbUser.githubUsername = login;
          await dbUser.save();
        }
      }
    }

    if (!login) {
      return NextResponse.json({ activity: [] });
    }

    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(login)}/events`,
      {
        headers: {
          Authorization: `Bearer ${dbUser.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ activity: [] });
    }

    const events = (await response.json()) as GitHubEvent[];

    const recentShas = events
      .filter((e) => e.type === "PushEvent")
      .flatMap((e) => (e.payload.commits || []).map((c) => c.sha).filter(Boolean) as string[]);

    const attributed =
      recentShas.length > 0
        ? await GitContributionModel.find({
            userId: user.id,
            sha: { $in: recentShas },
          }).select("sha commitTag goalId")
        : [];
    const bySha = new Map(attributed.map((c) => [c.sha, c]));

    const pushEvents = events.filter((e) => e.type === "PushEvent").slice(0, 10);
    const prEvents = events
      .filter((e) => e.type === "PullRequestEvent")
      .slice(0, 5);

    const activity = [
      ...pushEvents.map((e) => {
        const first = e.payload.commits?.[0];
        const message = first?.message || "Pushed commits";
        const tag = first?.sha
          ? bySha.get(first.sha)?.commitTag || parseCommitTag(message)
          : parseCommitTag(message);
        return {
          id: e.id,
          type: "commit" as const,
          repo: e.repo.name,
          message,
          timestamp: e.created_at,
          count: e.payload.commits?.length || 1,
          commitTag: tag || undefined,
          attributed: first?.sha ? bySha.has(first.sha) : false,
        };
      }),
      ...prEvents.map((e) => ({
        id: e.id,
        type: "pull_request" as const,
        repo: e.repo.name,
        message: e.payload.pull_request?.title,
        status: e.payload.action,
        timestamp: e.created_at,
        commitTag: parseCommitTag(e.payload.pull_request?.title || "") || undefined,
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
