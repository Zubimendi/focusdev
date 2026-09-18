import bcrypt from "bcryptjs";
import { connectToDatabase } from "@focus/db";
import { UserModel, type IUserDocument } from "@focus/db/models";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

/**
 * Shared credential lookup for NextAuth authorize and mobile /api/auth/login.
 * Always normalizes email (lowercase + trim) so web and mobile hit the same user.
 */
export async function findUserForLogin(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail || !password) {
    return null;
  }

  await connectToDatabase();

  const user = (await UserModel.findOne({ email: normalizedEmail }).select(
    "+password"
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
  };
}
