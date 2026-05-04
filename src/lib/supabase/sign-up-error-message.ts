/**
 * Turns Supabase Auth sign-up errors into copy that points at likely fixes.
 * Confirmation / redirect issues are configured in the Supabase dashboard, not in app code.
 */

function alternateOriginLoginUrl(origin: string): string | null {
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
      return null;
    }
    let altHost: string | null = null;
    if (host.startsWith("www.")) {
      altHost = host.slice(4);
    } else {
      altHost = `www.${host}`;
    }
    if (!altHost) return null;
    return `${u.protocol}//${altHost}/login`;
  } catch {
    return null;
  }
}

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
    const loginUrl = `${origin}/login`;
    const altLogin = alternateOriginLoginUrl(origin);
    const lines = [
      msg,
      "",
      "Typical fixes (Supabase dashboard → Authentication → URL configuration):",
      `• Redirect URLs must list this exact entry: ${loginUrl}`,
    ];
    if (altLogin) {
      lines.push(`• Also add the other hostname (apex ↔ www): ${altLogin}`);
    }
    lines.push(
      "• Site URL should be the same host users open in the browser (including www if you use it).",
      "",
      "If redirects look correct, this error is often mail delivery — not the app:",
      "• Authentication → Emails: check custom SMTP (or use Supabase’s default mailer).",
      "• Dashboard → Logs → filter Auth / API errors around the signup time.",
      "• Auth rate limits or provider blocks can stop outbound mail.",
      "",
      "Temporary (testing only): turn off “Confirm email” under Authentication → Providers → Email."
    );
    return lines;
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
