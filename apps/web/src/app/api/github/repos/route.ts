import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

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
        {
          error: "GitHub not connected",
          code: "GITHUB_NOT_CONNECTED",
        },
        { status: 403 }
      );
    }

    const response = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${dbUser.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "FocusDev",
        },
      }
    );

    if (response.status === 401) {
      return NextResponse.json(
        {
          error: "GitHub token expired. Reconnect GitHub in Settings.",
          code: "GITHUB_TOKEN_EXPIRED",
        },
        { status: 403 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub repositories" },
        { status: 502 }
      );
    }

    const repos = await response.json();
    return NextResponse.json(repos);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
