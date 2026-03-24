import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export async function GET(req: Request) {
  try {
    // 1. Try NextAuth session (Cookie based)
    const sessionUser = await getCurrentUser();
    if (sessionUser) {
      return NextResponse.json({ user: sessionUser }, { status: 200 });
    }

    // 2. Try JWT (Header based for Mobile)
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
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
