import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { ProjectModel } from "@focus/db/models";
import { ProjectSchema } from "@focus/shared";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const projects = await ProjectModel.find({ 
      $or: [{ ownerId: user.id }, { members: user.id }] 
    }).sort({ updatedAt: -1 });
    
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = ProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 });
    }

    await connectToDatabase();
    const project = await ProjectModel.create({
      ...validation.data,
      ownerId: user.id,
      members: [user.id],
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
