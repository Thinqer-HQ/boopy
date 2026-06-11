import { NextResponse } from "next/server";

import { exchangeGoogleDriveCode } from "@/lib/drive/google-drive";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/notifications?drive=error", request.url));
  }

  const [workspaceId, , , redirectToken] = state.split("|");
  const redirectPath = redirectToken ? decodeURIComponent(redirectToken) : "/notifications";
  const safeRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : "/notifications";

  if (!workspaceId) {
    return NextResponse.redirect(new URL("/notifications?drive=error", request.url));
  }

  try {
    const token = await exchangeGoogleDriveCode(code);
    const supabase = supabaseService();
    const tokenExpiresAt = token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null;
    await supabase.from("drive_integrations").upsert(
      {
        workspace_id: workspaceId,
        access_token: token.access_token,
        refresh_token: token.refresh_token ?? null,
        token_expires_at: tokenExpiresAt,
        enabled: true,
      },
      { onConflict: "workspace_id" }
    );
    return NextResponse.redirect(new URL(`${safeRedirectPath}?drive=connected`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`${safeRedirectPath}?drive=error`, request.url));
  }
}
