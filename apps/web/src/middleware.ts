import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { rateLimit, corsHeaders } from "./lib/security";

export default withAuth(
  function middleware(req: NextRequest) {
    const limitResponse = rateLimit(req);
    if (limitResponse) return limitResponse;

    const response = NextResponse.next();
    return corsHeaders(req, response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const bearer = req.headers.get("authorization");
        if (bearer?.startsWith("Bearer ")) return true;
        return !!token;
      },
    },
  }
);

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
