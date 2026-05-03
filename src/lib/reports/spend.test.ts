import { describe, expect, it } from "vitest";

import { calculateTotals, calculateTotalsByCurrency, toMonthlyAmount } from "@/lib/reports/spend";

describe("reports spend helpers", () => {
  it("normalizes yearly plans to monthly spend", () => {
    expect(toMonthlyAmount({ amount: 120, cadence: "yearly", status: "active" })).toBe(10);
    expect(toMonthlyAmount({ amount: 20, cadence: "monthly", status: "active" })).toBe(20);
  });

  it("normalizes quarterly plans to monthly spend", () => {
    expect(toMonthlyAmount({ amount: 30, cadence: "quarterly", status: "active" })).toBe(10);
  });

  it("aggregates monthly and yearly totals", () => {
    const totals = calculateTotals([
      { amount: 120, cadence: "yearly", status: "active" },
      { amount: 15, cadence: "monthly", status: "active" },
      { amount: 100, cadence: "monthly", status: "paused" },
    ]);
    expect(totals.monthly).toBe(25);
    expect(totals.yearly).toBe(300);
  });

  it("aggregates totals by original currency without mixing", () => {
    const totals = calculateTotalsByCurrency([
      { amount: 120, cadence: "yearly", status: "active", currency: "USD" },
      { amount: 15, cadence: "monthly", status: "active", currency: "USD" },
      { amount: 100, cadence: "monthly", status: "active", currency: "PHP" },
      { amount: 200, cadence: "monthly", status: "paused", currency: "PHP" },
    ]);

    expect(totals).toEqual([
      { currency: "PHP", monthly: 100, yearly: 1200 },
      { currency: "USD", monthly: 25, yearly: 300 },
    ]);
  });
});
