import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@focus/db";
import { TaskModel } from "@focus/db/models";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { githubPullRequest, githubCommit } = await req.json();
    await connectToDatabase();
    
    const task = await TaskModel.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { githubPullRequest, githubCommit },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
