import "server-only";

import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const optionalNonEmpty = z.string().trim().min(1).optional();
const requiredNonEmptyInProd = isProduction ? z.string().trim().min(1) : optionalNonEmpty;

const optionalUrl = z.string().url().optional();
const requiredUrlInProd = isProduction ? z.string().url() : optionalUrl;

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: isProduction
    ? z.string().url()
    : z.string().url().default("http://localhost:3000"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: requiredUrlInProd,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredNonEmptyInProd,
  SUPABASE_SERVICE_ROLE_KEY: requiredNonEmptyInProd,

  // Resend
  RESEND_API_KEY: requiredNonEmptyInProd,
  RESEND_FROM_EMAIL: isProduction
    ? z.string().trim().min(1)
    : z.string().trim().min(1).default("Boopy <no-reply@yourdomain.com>"),

  // Web Push
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: requiredNonEmptyInProd,
  VAPID_PRIVATE_KEY: requiredNonEmptyInProd,

  // Stripe
  STRIPE_SECRET_KEY: requiredNonEmptyInProd,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredNonEmptyInProd,
  STRIPE_WEBHOOK_SECRET: requiredNonEmptyInProd,

  // PostHog
  NEXT_PUBLIC_POSTHOG_KEY: requiredNonEmptyInProd,
  NEXT_PUBLIC_POSTHOG_HOST: isProduction
    ? z.string().url()
    : z.string().url().default("https://us.i.posthog.com"),

  // Sentry
  SENTRY_AUTH_TOKEN: requiredNonEmptyInProd,
  SENTRY_DSN: requiredNonEmptyInProd,
  NEXT_PUBLIC_SENTRY_DSN: requiredNonEmptyInProd,

  // Axiom
  AXIOM_TOKEN: requiredNonEmptyInProd,
  AXIOM_DATASET: requiredNonEmptyInProd,
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const message = `Invalid environment variables:\n${result.error.toString()}`;
    throw new Error(message);
  }
  return result.data;
}

export const env: Env = (() => {
  if (cachedEnv) return cachedEnv;
  cachedEnv = parseEnv();
  return cachedEnv;
})();
