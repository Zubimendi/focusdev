import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { rateLimit, corsHeaders } from "./lib/security";

export default withAuth(
  function middleware(req: NextRequest) {
    // 1. Rate Limiting
    const limitResponse = rateLimit(req);
    if (limitResponse) return limitResponse;

    const response = NextResponse.next();
    
    // 2. CORS Headers
    return corsHeaders(req, response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If it's a mobile request with a Bearer token, we handle it in the route handlers
        const bearer = req.headers.get("authorization");
        if (bearer?.startsWith("Bearer ")) return true;
        // Otherwise use NextAuth session
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/api/tasks/:path*",
    "/api/focus/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
  ],
};
