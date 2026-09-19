import { NextResponse } from "next/server";
import { LoginSchema } from "@focus/shared";
import jwt from "jsonwebtoken";
import {
  completeTwoFactor,
  findUserForLogin,
} from "@/lib/find-user-for-login";
import { authRateLimit } from "@/lib/security";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export async function POST(req: Request) {
  try {
    const limited = authRateLimit(req, "login");
    if (limited) return limited;

    const body = await req.json();

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password, totpCode, backupCode } = validation.data;
    const user = await findUserForLogin(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.twoFactorEnabled) {
      if (!totpCode && !backupCode) {
        const pendingToken = jwt.sign(
          { id: user.id, purpose: "2fa" },
          JWT_SECRET!,
          { expiresIn: "5m" }
        );
        return NextResponse.json(
          {
            requires2FA: true,
            pendingToken,
          },
          { status: 200 }
        );
      }

      const ok = await completeTwoFactor(user, { totpCode, backupCode });
      if (!ok) {
        return NextResponse.json(
          { error: "Invalid verification code." },
          { status: 401 }
        );
      }
    }

    await connectToDatabase();
    await UserModel.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Login error:", error.message);
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
