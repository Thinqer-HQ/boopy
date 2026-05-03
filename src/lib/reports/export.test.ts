import { describe, expect, it } from "vitest";

import {
  buildReportRows,
  buildReportsCsv,
  filterReportRows,
  type ReportExportRow,
} from "@/lib/reports/export";
import type { ReportSubscription } from "@/lib/reports/transformers";

function sampleSubscriptions(): ReportSubscription[] {
  return [
    {
      id: "sub-1",
      vendor_name: "Notion",
      category: "Productivity",
      amount: 12,
      currency: "USD",
      cadence: "monthly",
      status: "active",
      groups: { id: "g-1", name: "Ops" },
    },
    {
      id: "sub-2",
      vendor_name: "Figma",
      category: "Design",
      amount: 144,
      currency: "USD",
      cadence: "yearly",
      status: "active",
      groups: { id: "g-2", name: "Design Team" },
    },
  ];
}

describe("reports export helpers", () => {
  it("builds normalized report rows", () => {
    const rows = buildReportRows(sampleSubscriptions());
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      vendorName: "Notion",
      groupName: "Ops",
      cadence: "monthly",
      monthlyAmount: 12,
    });
  });

  it("filters rows by keyword and group", () => {
    const rows = buildReportRows(sampleSubscriptions());
    const filtered = filterReportRows(rows, { groupId: "g-2", keyword: "fig" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.vendorName).toBe("Figma");
  });

  it("filters rows by currency", () => {
    const rows = buildReportRows(sampleSubscriptions());
    const filtered = filterReportRows(rows, { currency: "USD" });
    expect(filtered).toHaveLength(2);
    const none = filterReportRows(rows, { currency: "PHP" });
    expect(none).toHaveLength(0);
  });

  it("creates csv with expected headers", () => {
    const rows: ReportExportRow[] = buildReportRows(sampleSubscriptions());
    const csv = buildReportsCsv(rows);
    expect(csv).toContain(
      "subscription_id,group_id,group_name,vendor_name,category,status,cadence,currency,amount,start_date,end_date,monthly_amount"
    );
    expect(csv).toContain("sub-1,g-1,Ops,Notion,Productivity,active,monthly,USD,12,,,12");
  });
});
