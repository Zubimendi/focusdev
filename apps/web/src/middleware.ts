import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit, corsHeaders } from "./lib/security";

function applySecurity(req: NextRequest) {
  const limitResponse = rateLimit(req);
  if (limitResponse) return limitResponse;
  const response = NextResponse.next();
  return corsHeaders(req, response);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isApi = path.startsWith("/api/");

  // GitHub APIs authenticate in the route handler (cookie or Bearer).
  if (path.startsWith("/api/github")) {
    return applySecurity(req);
  }

  const bearer = req.headers.get("authorization");
  const hasBearer = Boolean(bearer?.startsWith("Bearer "));
  const token = hasBearer
    ? true
    : await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return applySecurity(req);
}

export const config = {
  matcher: [
    "/api/tasks/:path*",
    "/api/focus/:path*",
    "/api/projects/:path*",
    "/api/goals/:path*",
    "/api/reviews/:path*",
    "/api/notes/:path*",
    "/api/habits/:path*",
    "/api/notifications/:path*",
    "/api/github/:path*",
    "/api/export",
    "/api/auth/me",
    "/api/auth/change-password",
    "/api/auth/delete-account",
    "/api/auth/2fa/:path*",
    "/dashboard/:path*",
    "/projects/:path*",
    "/checklists/:path*",
    "/timer/:path*",
    "/stats/:path*",
    "/reviews/:path*",
    "/settings/:path*",
    "/notes/:path*",
    "/new-session/:path*",
    "/support/:path*",
  ],
};
