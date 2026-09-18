import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

async function resolveUserId(req: Request): Promise<string | null> {
  const sessionUser = await getCurrentUser();
  if (sessionUser?.id) {
    return sessionUser.id;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as { id: string };
      return decoded.id;
    } catch {
      return null;
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (sessionUser) {
      return NextResponse.json({ user: sessionUser }, { status: 200 });
    }

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET!) as { id: string };
        await connectToDatabase();
        const user = await UserModel.findById(decoded.id).select("-password");
        if (user) {
          return NextResponse.json({ user }, { status: 200 });
        }
      } catch (err) {
        console.error("JWT verify failed:", err);
      }
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Me API error:", error.message);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "Name is required (1–100 characters)" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Profile update error:", error.message);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
