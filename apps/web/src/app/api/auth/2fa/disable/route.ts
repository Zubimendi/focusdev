import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Disable2FASchema } from "@focus/shared";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";
import { verifyTotp } from "@/lib/totp";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = Disable2FASchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Password is required to disable 2FA." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId).select(
      "+password +twoFactorSecret +backupCodesHash"
    );
    if (!user?.password) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const passwordOk = await bcrypt.compare(
      validation.data.password,
      user.password
    );
    if (!passwordOk) {
      return NextResponse.json(
        { error: "Password is incorrect." },
        { status: 400 }
      );
    }

    if (user.twoFactorEnabled && user.twoFactorSecret && validation.data.code) {
      const totpOk = await verifyTotp(
        validation.data.code,
        user.twoFactorSecret
      );
      if (!totpOk) {
        return NextResponse.json(
          { error: "Invalid authenticator code." },
          { status: 400 }
        );
      }
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodesHash = [];
    await user.save();

    await createNotification({
      userId,
      type: "security",
      title: "Two-factor authentication disabled",
      body: "2FA was turned off for your account.",
      href: "/settings",
    });

    return NextResponse.json({ message: "Two-factor authentication disabled." });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[2fa/disable]", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
