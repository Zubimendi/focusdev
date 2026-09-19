import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ChangePasswordSchema } from "@focus/shared";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { getCurrentUser } from "@/lib/auth-utils";
import { authRateLimit } from "@/lib/security";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

async function resolveUserId(req: Request): Promise<string | null> {
  const sessionUser = await getCurrentUser();
  if (sessionUser?.id) return sessionUser.id;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && JWT_SECRET) {
    try {
      const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as {
        id: string;
      };
      return decoded.id;
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const limited = authRateLimit(req, "change-password");
    if (limited) return limited;

    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = ChangePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Check your current password and new password requirements." },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;
    await connectToDatabase();
    const user = await UserModel.findById(userId).select("+password");
    if (!user?.password) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({ message: "Password updated." }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[change-password]", error.message);
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
