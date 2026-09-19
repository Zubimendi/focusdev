import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { resolveRequestUserId } from "@/lib/resolve-user";
import {
  generateTotpSecret,
  totpKeyuri,
} from "@/lib/totp";

export async function POST(req: Request) {
  try {
    const userId = await resolveRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId).select(
      "+twoFactorSecret +twoFactorEnabled"
    );
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled." },
        { status: 400 }
      );
    }

    const secret = generateTotpSecret();
    user.twoFactorSecret = secret;
    await user.save();

    const uri = totpKeyuri(user.email, secret);
    const qrDataUrl = await QRCode.toDataURL(uri);

    return NextResponse.json({
      secret,
      uri,
      qrDataUrl,
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[2fa/setup]", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
