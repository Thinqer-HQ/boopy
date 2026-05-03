import { toMonthlyAmount } from "@/lib/reports/spend";

export type ReportSubscription = {
  id: string;
  vendor_name: string;
  category: string | null;
  amount: number | string;
  currency: string;
  cadence: "monthly" | "yearly" | "quarterly" | "custom";
  status: "active" | "paused" | "cancelled";
  groups: { id?: string; name: string } | Array<{ id?: string; name: string }> | null;
};

type BreakdownRow = { label: string; total: number };
type CurrencySection = { currency: string; subscriptions: ReportSubscription[] };

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function buildMonthlyTrend(subscriptions: ReportSubscription[], months: number) {
  const now = new Date();
  const labels: string[] = [];
  const rows: { month: string; total: number }[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const label = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
    labels.push(label);
    rows.push({ month: label, total: 0 });
  }

  const monthlyTotal = subscriptions.reduce((sum, subscription) => {
    return (
      sum +
      toMonthlyAmount({
        amount: subscription.amount,
        cadence: subscription.cadence,
        status: subscription.status,
      })
    );
  }, 0);

  return rows.map((row) => ({ ...row, total: monthlyTotal }));
}

export function buildCategoryBreakdown(subscriptions: ReportSubscription[]): BreakdownRow[] {
  const map = new Map<string, number>();
  for (const subscription of subscriptions) {
    const label = subscription.category?.trim() || "Uncategorized";
    const monthly = toMonthlyAmount({
      amount: subscription.amount,
      cadence: subscription.cadence,
      status: subscription.status,
    });
    map.set(label, (map.get(label) ?? 0) + monthly);
  }
  return Array.from(map.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);
}

export function buildVendorBreakdown(subscriptions: ReportSubscription[]): BreakdownRow[] {
  return subscriptions
    .map((subscription) => ({
      label: subscription.vendor_name,
      total: toMonthlyAmount({
        amount: subscription.amount,
        cadence: subscription.cadence,
        status: subscription.status,
      }),
    }))
    .sort((a, b) => b.total - a.total);
}

export function buildGroupBreakdown(subscriptions: ReportSubscription[]): BreakdownRow[] {
  const map = new Map<string, number>();
  for (const subscription of subscriptions) {
    const group = first(subscription.groups);
    const label = group?.name ?? "Unknown";
    const monthly = toMonthlyAmount({
      amount: subscription.amount,
      cadence: subscription.cadence,
      status: subscription.status,
    });
    map.set(label, (map.get(label) ?? 0) + monthly);
  }
  return Array.from(map.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);
}

export function splitSubscriptionsByCurrency(
  subscriptions: ReportSubscription[]
): CurrencySection[] {
  const map = new Map<string, ReportSubscription[]>();
  for (const subscription of subscriptions) {
    const currency = (subscription.currency ?? "USD").toUpperCase();
    const rows = map.get(currency) ?? [];
    rows.push(subscription);
    map.set(currency, rows);
  }
  return Array.from(map.entries())
    .map(([currency, groupedSubscriptions]) => ({
      currency,
      subscriptions: groupedSubscriptions,
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}
