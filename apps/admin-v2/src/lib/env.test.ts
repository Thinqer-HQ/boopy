import { describe, expect, it } from "vitest";

import { parseAdminEnv } from "@/lib/env";

describe("parseAdminEnv", () => {
  it("throws when a required var is missing", () => {
    expect(() =>
      parseAdminEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        SUPABASE_SERVICE_ROLE_KEY: "service-key",
        STRIPE_SECRET_KEY: "sk_test_123",
      })
    ).toThrow();
  });

  it("returns parsed values when all required vars are present", () => {
    const env = parseAdminEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      STRIPE_SECRET_KEY: "sk_test_123",
    });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.STRIPE_SECRET_KEY).toBe("sk_test_123");
  });
});
