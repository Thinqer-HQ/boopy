import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import { log } from "@/lib/log";

export function GET() {
  const env = getEnv();
  log.info("health_check", { appUrl: env.NEXT_PUBLIC_APP_URL });
  return NextResponse.json({ ok: true });
}
