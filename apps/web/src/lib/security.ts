import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (for demonstration, use Redis in production)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;
const ipRequests = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(request: NextRequest) {
  const ip = request.ip || "unknown";
  const now = Date.now();
  const userData = ipRequests.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > RATE_LIMIT_WINDOW) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  ipRequests.set(ip, userData);

  if (userData.count > MAX_REQUESTS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return null;
}

export function corsHeaders(request: NextRequest, response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*"); // Customize this!
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}
