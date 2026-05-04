/**
 * Turns Supabase Auth sign-up errors into copy that points at likely fixes.
 * Confirmation / redirect issues are configured in the Supabase dashboard, not in app code.
 */
export function signUpErrorLines(raw: string | undefined): string[] {
  const msg = (raw ?? "").trim();
  const lower = msg.toLowerCase();

  const isConfirmEmailIssue =
    lower.includes("confirmation email") ||
    lower.includes("confirm your email") ||
    (lower.includes("email") && lower.includes("error sending")) ||
    lower.includes("error sending confirmation");

  if (isConfirmEmailIssue) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://your-app.example";
    return [
      msg,
      "",
      "Typical causes (fix in the Supabase dashboard for this project):",
      `• Redirect URLs must include: ${origin}/login`,
      "• Site URL should match the app users open (same host as above).",
      "• If email confirmations are on: configure SMTP or use Supabase mail; check Auth rate limits / logs.",
    ];
  }

  if (lower.includes("redirect") && (lower.includes("not allowed") || lower.includes("url"))) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://your-app.example";
    return [
      msg,
      "",
      `Add ${origin}/login under Authentication → URL configuration → Redirect URLs.`,
    ];
  }

  return msg ? [msg] : ["Sign up failed. Try again or contact support."];
}
