import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@focus/db";
import { ProjectModel } from "@focus/db/models";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { githubRepoId, githubRepoFullName } = await req.json();
    await connectToDatabase();
    
    const project = await ProjectModel.findOneAndUpdate(
      { _id: params.id, ownerId: session.user.id },
      { githubRepoId, githubRepoFullName, githubRepo: githubRepoFullName },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
