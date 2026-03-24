import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Unified auth function that supports both NextAuth sessions (web)
 * and JWT Bearer tokens (mobile). Use this in all protected API routes.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  // 1. Try NextAuth session (cookie-based, for web dashboard)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return {
        id: (session.user as any).id,
        email: session.user.email!,
        name: session.user.name || undefined,
      };
    }
  } catch (err) {
    // NextAuth session not available, continue to JWT
  }

  // 2. Try JWT Bearer token (header-based, for mobile app)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as { id: string; email: string };
      await connectToDatabase();
      const user = await UserModel.findById(decoded.id).select("-password");
      if (user) {
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || undefined,
        };
      }
    } catch (err) {
      // Invalid or expired token
    }
  }

  return null;
}
