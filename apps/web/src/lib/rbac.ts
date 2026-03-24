import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
    };
  }
}

export type Role = "user" | "admin" | "moderator";

export function authorize(roles: Role[]) {
  return async () => {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!roles.includes(user.role as Role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    return null;
  };
}
