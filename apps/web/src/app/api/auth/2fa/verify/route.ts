import { NextResponse } from "next/server";
import { TotpCodeSchema } from "@focus/shared";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { verifyTotp, consumeBackupCode } from "@/lib/totp";
import { authRateLimit } from "@/lib/security";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

/**
 * Completes login after password was verified and a pending2FA token was issued.
 * Body: { pendingToken, code? , backupCode? }
 */
export async function POST(req: Request) {
  try {
    const limited = authRateLimit(req, "2fa-verify");
    if (limited) return limited;

    const body = await req.json();
    const pendingToken = body?.pendingToken as string | undefined;
    if (!pendingToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: { id: string; purpose?: string };
    try {
      payload = jwt.verify(pendingToken, JWT_SECRET!) as {
        id: string;
        purpose?: string;
      };
    } catch {
      return NextResponse.json(
        { error: "Session expired. Sign in again." },
        { status: 401 }
      );
    }

    if (payload.purpose !== "2fa") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(payload.id).select(
      "+twoFactorSecret +backupCodesHash"
    );
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let ok = false;
    if (body.code) {
      const parsed = TotpCodeSchema.safeParse({ code: String(body.code) });
      if (parsed.success) {
        ok = await verifyTotp(parsed.data.code, user.twoFactorSecret);
      }
    } else if (body.backupCode) {
      const result = await consumeBackupCode(
        String(body.backupCode),
        user.backupCodesHash || []
      );
      if (result.ok) {
        ok = true;
        user.backupCodesHash = result.remaining;
        await user.save();
      }
    }

    if (!ok) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        twoFactorEnabled: true,
      },
      token,
      // For NextAuth web clients: signal to complete credentials with totp
      nextAuthHint: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[2fa/verify]", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
