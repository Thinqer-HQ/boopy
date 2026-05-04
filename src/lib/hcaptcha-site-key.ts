/** Public site key for `@hcaptcha/react-hcaptcha` (optional). Pair with Supabase Auth CAPTCHA (hCaptcha secret in dashboard). */
export function getHcaptchaSiteKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY?.trim();
  return key || undefined;
}
