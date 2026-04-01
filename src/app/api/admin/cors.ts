import { NextResponse } from "next/server";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "aite-admin-2026";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
};

export function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS });
}

export function corsOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function checkAuth(request: Request): boolean {
  const key = request.headers.get("X-Admin-Key");
  return key === ADMIN_KEY;
}

export function unauthorized() {
  return corsJson({ error: "Unauthorized" }, 401);
}
