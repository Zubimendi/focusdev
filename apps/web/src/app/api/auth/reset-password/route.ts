import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ResetPasswordSchema } from "@focus/shared";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { hashToken } from "@/lib/crypto-tokens";
import { authRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const limited = authRateLimit(req, "reset-password");
    if (limited) return limited;

    const body = await req.json();
    const validation = ResetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Request a new one." },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;
    const tokenHash = hashToken(token);

    await connectToDatabase();
    const user = await UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetTokenHash +passwordResetExpires");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Request a new one." },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password updated. You can sign in now." },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[reset-password]", error.message);
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
