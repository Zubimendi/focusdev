import bcrypt from "bcryptjs";
import { connectToDatabase } from "@focus/db";
import { UserModel, type IUserDocument } from "@focus/db/models";
import { consumeBackupCode, verifyTotp } from "@/lib/totp";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  twoFactorEnabled: boolean;
};

/**
 * Shared credential lookup for NextAuth authorize and mobile /api/auth/login.
 * Always normalizes email (lowercase + trim) so web and mobile hit the same user.
 */
export async function findUserForLogin(
  email: string,
  password: string
): Promise<(AuthUser & { twoFactorSecret?: string; backupCodesHash?: string[] }) | null> {
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail || !password) {
    return null;
  }

  await connectToDatabase();

  const user = (await UserModel.findOne({ email: normalizedEmail }).select(
    "+password +twoFactorSecret +backupCodesHash"
  )) as IUserDocument | null;

  if (!user || !user.password) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    twoFactorSecret: user.twoFactorSecret,
    backupCodesHash: user.backupCodesHash,
  };
}

export async function completeTwoFactor(
  user: {
    id: string;
    twoFactorSecret?: string;
    backupCodesHash?: string[];
  },
  opts: { totpCode?: string; backupCode?: string }
): Promise<boolean> {
  if (!user.twoFactorSecret) return false;

  if (opts.totpCode) {
    return verifyTotp(opts.totpCode, user.twoFactorSecret);
  }

  if (opts.backupCode && user.backupCodesHash?.length) {
    const result = await consumeBackupCode(
      opts.backupCode,
      user.backupCodesHash
    );
    if (result.ok) {
      await UserModel.findByIdAndUpdate(user.id, {
        backupCodesHash: result.remaining,
      });
      return true;
    }
  }

  return false;
}
