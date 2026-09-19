import { NextResponse } from "next/server";
import { TotpCodeSchema } from "@focus/shared";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";
import {
  generateBackupCodes,
  hashBackupCodes,
  verifyTotp,
} from "@/lib/totp";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = TotpCodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Enter a valid 6-digit code." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId).select(
      "+twoFactorSecret +backupCodesHash"
    );
    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "Start setup before enabling 2FA." },
        { status: 400 }
      );
    }

    const ok = await verifyTotp(validation.data.code, user.twoFactorSecret);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid authenticator code." },
        { status: 400 }
      );
    }

    const plainCodes = generateBackupCodes(8);
    user.twoFactorEnabled = true;
    user.backupCodesHash = await hashBackupCodes(plainCodes);
    await user.save();

    await createNotification({
      userId,
      type: "security",
      title: "Two-factor authentication enabled",
      body: "Your account now requires an authenticator code at sign-in.",
      href: "/settings",
    });

    return NextResponse.json({
      message: "Two-factor authentication enabled.",
      backupCodes: plainCodes,
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[2fa/enable]", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
