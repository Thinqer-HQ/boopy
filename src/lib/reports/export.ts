import { toAmount, toMonthlyAmount } from "@/lib/reports/spend";
import type { ReportSubscription } from "@/lib/reports/transformers";

export type ReportExportRow = {
  subscriptionId: string;
  groupId: string;
  groupName: string;
  vendorName: string;
  category: string;
  status: "active" | "paused" | "cancelled";
  cadence: "monthly" | "yearly" | "custom";
  currency: string;
  amount: number;
  monthlyAmount: number;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function csvEscape(value: string | number) {
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function buildReportRows(subscriptions: ReportSubscription[]): ReportExportRow[] {
  return subscriptions.map((subscription) => {
    const group = first(subscription.groups);
    const amount = toAmount(subscription.amount);
    return {
      subscriptionId: subscription.id,
      groupId: group?.id ?? "",
      groupName: group?.name ?? "Unknown",
      vendorName: subscription.vendor_name,
      category: subscription.category?.trim() || "Uncategorized",
      status: subscription.status,
      cadence: subscription.cadence,
      currency: subscription.currency,
      amount,
      monthlyAmount: toMonthlyAmount({
        amount,
        cadence: subscription.cadence,
        status: subscription.status,
      }),
    };
  });
}

export function filterReportRows(
  rows: ReportExportRow[],
  filters: { groupId?: string | null; keyword?: string | null; currency?: string | null }
) {
  const groupId = filters.groupId?.trim();
  const keyword = filters.keyword?.trim().toLowerCase();
  const currency = filters.currency?.trim().toUpperCase();
  return rows.filter((row) => {
    if (groupId && row.groupId !== groupId) return false;
    if (currency && row.currency !== currency) return false;
    if (!keyword) return true;
    const haystack =
      `${row.groupName} ${row.vendorName} ${row.category} ${row.currency}`.toLowerCase();
    return haystack.includes(keyword);
  });
}

export function buildReportsCsv(rows: ReportExportRow[]) {
  const headers = [
    "subscription_id",
    "group_id",
    "group_name",
    "vendor_name",
    "category",
    "status",
    "cadence",
    "currency",
    "amount",
    "monthly_amount",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.subscriptionId,
        row.groupId,
        row.groupName,
        row.vendorName,
        row.category,
        row.status,
        row.cadence,
        row.currency,
        row.amount,
        row.monthlyAmount,
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  return lines.join("\n");
}
