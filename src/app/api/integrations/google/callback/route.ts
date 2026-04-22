import { NextResponse } from "next/server";

import { exchangeGoogleCode } from "@/lib/calendar/google";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings/notifications?calendar=error", request.url));
  }

  const [workspaceId, , , redirectToken] = state.split("|");
  const redirectPath = redirectToken
    ? decodeURIComponent(redirectToken)
    : "/settings/notifications";
  const safeRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : "/settings/notifications";
  if (!workspaceId) {
    return NextResponse.redirect(new URL("/settings/notifications?calendar=error", request.url));
  }

  try {
    const token = await exchangeGoogleCode(code);
    const supabase = supabaseService();
    const tokenExpiresAt = token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null;
    await supabase.from("calendar_integrations").upsert(
      {
        workspace_id: workspaceId,
        provider: "google",
        access_token: token.access_token,
        refresh_token: token.refresh_token ?? null,
        token_expires_at: tokenExpiresAt,
        calendar_id: "primary",
      },
      { onConflict: "workspace_id,provider" }
    );
    return NextResponse.redirect(new URL(`${safeRedirectPath}?calendar=connected`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`${safeRedirectPath}?calendar=error`, request.url));
  }
}
