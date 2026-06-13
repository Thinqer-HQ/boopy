import "server-only";

import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";

export function checkAdminAuth(request: Request): NextResponse | null {
  const secret = getEnv().BOOPY_ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Admin API is not configured" }, { status: 503 });
  }
  const provided =
    request.headers.get("x-admin-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  if (provided !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
