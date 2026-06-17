import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),
  STRIPE_SECRET_KEY: z.string().trim().min(1),
});

export type AdminEnv = z.infer<typeof envSchema>;

export function parseAdminEnv(source: Record<string, string | undefined>): AdminEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid admin-v2 environment variables:\n${result.error.toString()}`);
  }
  return result.data;
}

let cached: AdminEnv | undefined;

export function getEnv(): AdminEnv {
  if (!cached) {
    cached = parseAdminEnv(process.env);
  }
  return cached;
}
