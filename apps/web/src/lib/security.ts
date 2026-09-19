import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 120;
const AUTH_WINDOW = 15 * 60 * 1000;
const AUTH_MAX = 20;

const ipRequests = new Map<string, { count: number; lastReset: number }>();
const authBuckets = new Map<string, { count: number; lastReset: number }>();

function clientIp(request: Request | NextRequest): string {
  if ("ip" in request && request.ip) return request.ip;
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

export function rateLimit(request: NextRequest) {
  const ip = clientIp(request);
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

/** Stricter limit for auth-sensitive endpoints */
export function authRateLimit(request: Request, bucket: string) {
  const ip = clientIp(request);
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const data = authBuckets.get(key) || { count: 0, lastReset: now };

  if (now - data.lastReset > AUTH_WINDOW) {
    data.count = 1;
    data.lastReset = now;
  } else {
    data.count++;
  }
  authBuckets.set(key, data);

  if (data.count > AUTH_MAX) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }
  return null;
}

export function corsHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin") || "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
