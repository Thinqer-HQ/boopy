import { describe, expect, it } from "vitest";

import {
  buildCategoryBreakdown,
  buildGroupBreakdown,
  splitSubscriptionsByCurrency,
} from "@/lib/reports/transformers";

const rows = [
  {
    id: "1",
    vendor_name: "Netflix",
    category: "Streaming",
    amount: 10,
    currency: "USD",
    cadence: "monthly" as const,
    status: "active" as const,
    groups: { name: "Personal" },
  },
  {
    id: "2",
    vendor_name: "Vercel",
    category: "Hosting",
    amount: 120,
    currency: "USD",
    cadence: "yearly" as const,
    status: "active" as const,
    groups: { name: "Agency" },
  },
];

describe("report transformers", () => {
  it("creates category totals", () => {
    const breakdown = buildCategoryBreakdown(rows);
    expect(breakdown[0]?.label).toBe("Streaming");
    expect(breakdown[0]?.total).toBe(10);
  });

  it("creates group totals", () => {
    const breakdown = buildGroupBreakdown(rows);
    expect(breakdown).toHaveLength(2);
  });

  it("splits subscriptions into per-currency sections", () => {
    const sections = splitSubscriptionsByCurrency([
      ...rows,
      {
        ...rows[0],
        id: "3",
        currency: "PHP",
      },
    ]);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.currency).toBe("PHP");
    expect(sections[0]?.subscriptions).toHaveLength(1);
    expect(sections[1]?.currency).toBe("USD");
    expect(sections[1]?.subscriptions).toHaveLength(2);
  });
});
