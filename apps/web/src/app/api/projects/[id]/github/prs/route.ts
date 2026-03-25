import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@focus/db";
import { ProjectModel } from "@focus/db/models";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.githubAccessToken) {
    return NextResponse.json({ error: "Unauthorized or GitHub Not Connected" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const project = await ProjectModel.findOne({ _id: params.id, ownerId: session.user.id });

    if (!project || !project.githubRepoFullName) {
      return NextResponse.json({ error: "Project not found or no repo linked" }, { status: 404 });
    }

    const response = await fetch(`https://api.github.com/repos/${project.githubRepoFullName}/pulls?state=all&sort=updated`, {
      headers: {
        Authorization: `Bearer ${session.user.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pull requests");
    }

    const prs = await response.json();
    return NextResponse.json(prs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
