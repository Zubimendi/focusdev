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
      authorized: ({ token }) => !!token,
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
