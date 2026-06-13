import { NextResponse } from "next/server";

import { ADMIN_OPENAPI_SPEC } from "@/lib/admin/openapi-spec";

export async function GET() {
  return NextResponse.json(ADMIN_OPENAPI_SPEC, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
