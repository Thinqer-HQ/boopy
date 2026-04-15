import { describe, expect, it } from "vitest";

import {
  canCreateClient,
  canCreateSubscription,
  getPlanCapabilities,
  resolvePlan,
  type WorkspacePlan,
} from "@/lib/billing/plan";

describe("resolvePlan", () => {
  it("falls back to free for unknown values", () => {
    expect(resolvePlan("enterprise")).toBe("free");
    expect(resolvePlan(undefined)).toBe("free");
  });

  it("accepts free and pro", () => {
    expect(resolvePlan("free")).toBe("free");
    expect(resolvePlan("pro")).toBe("pro");
  });
});

describe("plan capabilities", () => {
  it("free plan has strict limits", () => {
    const caps = getPlanCapabilities("free");
    expect(caps.maxClients).toBe(3);
    expect(caps.maxSubscriptions).toBe(30);
  });

  it("pro plan has effectively no limits", () => {
    const caps = getPlanCapabilities("pro");
    expect(caps.maxClients).toBeGreaterThan(1000);
    expect(caps.maxSubscriptions).toBeGreaterThan(1000);
  });
});

describe("gating checks", () => {
  it("blocks creation at limits for free plan", () => {
    const plan: WorkspacePlan = "free";
    expect(canCreateClient(plan, 2)).toBe(true);
    expect(canCreateClient(plan, 3)).toBe(false);
    expect(canCreateSubscription(plan, 29)).toBe(true);
    expect(canCreateSubscription(plan, 30)).toBe(false);
  });
});
