import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { ProjectModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { githubRepoId, githubRepoFullName } = await req.json();
    if (!githubRepoFullName || typeof githubRepoFullName !== "string") {
      return NextResponse.json(
        { error: "Repository name is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const project = await ProjectModel.findOneAndUpdate(
      { _id: params.id, ownerId: user.id },
      {
        githubRepoId,
        githubRepoFullName,
        githubRepo: githubRepoFullName,
      },
      { new: true }
    );

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
