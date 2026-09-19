import { NextResponse } from "next/server";
import { ForgotPasswordSchema } from "@focus/shared";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { generateResetToken, hashToken } from "@/lib/crypto-tokens";
import { passwordResetEmailHtml, sendEmail } from "@/lib/email";
import { authRateLimit } from "@/lib/security";

const GENERIC = {
  message:
    "If an account exists for that email, we sent reset instructions.",
};

export async function POST(req: Request) {
  try {
    const limited = authRateLimit(req, "forgot-password");
    if (limited) return limited;

    const body = await req.json();
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      // Still generic — don't reveal validation shape differences for email
      return NextResponse.json(GENERIC, { status: 200 });
    }

    const email = validation.data.email.toLowerCase().trim();
    await connectToDatabase();
    const user = await UserModel.findOne({ email }).select(
      "+passwordResetTokenHash +passwordResetExpires"
    );

    if (user) {
      const token = generateResetToken();
      user.passwordResetTokenHash = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const base =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
      const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${token}`;

      try {
        await sendEmail({
          to: email,
          subject: "Reset your FocusDev password",
          html: passwordResetEmailHtml(resetUrl),
          text: `Reset your password: ${resetUrl}`,
        });
      } catch (err) {
        console.error("[forgot-password] email failed", err);
      }
    }

    return NextResponse.json(GENERIC, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[forgot-password]", error.message);
    }
    return NextResponse.json(GENERIC, { status: 200 });
  }
}
