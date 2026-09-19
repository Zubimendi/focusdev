import jwt from "jsonwebtoken";
import { getCurrentUser } from "@/lib/auth-utils";

const JWT_SECRET = process.env.JWT_SECRET;

export async function resolveRequestUserId(
  req: Request
): Promise<string | null> {
  const sessionUser = await getCurrentUser();
  if (sessionUser?.id) return sessionUser.id;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && JWT_SECRET) {
    try {
      const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as {
        id: string;
      };
      return decoded.id;
    } catch {
      return null;
    }
  }
  return null;
}
