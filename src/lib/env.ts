import "server-only";

import { z } from "zod";

const strictEnv =
  process.env.ENV_STRICT === "true" ||
  (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview");

const optionalNonEmpty = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional()
);
const requiredNonEmptyInStrict = strictEnv ? z.string().trim().min(1) : optionalNonEmpty;

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional()
);
const requiredUrlInStrict = strictEnv ? z.string().url() : optionalUrl;

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: strictEnv
    ? z.string().url()
    : z.string().url().default("http://localhost:3000"),
  CRON_SECRET: requiredNonEmptyInStrict,

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: requiredUrlInStrict,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredNonEmptyInStrict,
  SUPABASE_SERVICE_ROLE_KEY: requiredNonEmptyInStrict,

  // Resend
  RESEND_API_KEY: requiredNonEmptyInStrict,
  RESEND_FROM_EMAIL: strictEnv
    ? z.string().trim().min(1)
    : z.string().trim().min(1).default("Boopy <no-reply@yourdomain.com>"),

  // Web Push
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: requiredNonEmptyInStrict,
  VAPID_PRIVATE_KEY: requiredNonEmptyInStrict,

  // Stripe
  STRIPE_SECRET_KEY: requiredNonEmptyInStrict,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredNonEmptyInStrict,
  STRIPE_WEBHOOK_SECRET: requiredNonEmptyInStrict,
  STRIPE_PRICE_PRO_MONTHLY: requiredNonEmptyInStrict,

  // PostHog
  NEXT_PUBLIC_POSTHOG_KEY: requiredNonEmptyInStrict,
  NEXT_PUBLIC_POSTHOG_HOST: strictEnv
    ? z.string().url()
    : z.string().url().default("https://us.i.posthog.com"),

  // Sentry
  SENTRY_AUTH_TOKEN: requiredNonEmptyInStrict,
  SENTRY_DSN: requiredNonEmptyInStrict,
  NEXT_PUBLIC_SENTRY_DSN: requiredNonEmptyInStrict,

  // Axiom
  AXIOM_TOKEN: requiredNonEmptyInStrict,
  AXIOM_DATASET: requiredNonEmptyInStrict,
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

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  cachedEnv = parseEnv();
  return cachedEnv;
}
