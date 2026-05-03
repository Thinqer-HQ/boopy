type Cadence = "monthly" | "yearly" | "quarterly" | "custom";

export type SpendInput = {
  amount: number | string | null | undefined;
  cadence: Cadence;
  status: "active" | "paused" | "cancelled";
  /** YYYY-MM-DD last day the subscription runs; after this (UTC calendar day) it contributes $0 to spend. */
  termEndDateYmd?: string | null;
};

export type SpendByCurrencyInput = SpendInput & {
  currency: string | null | undefined;
};

export function toAmount(value: number | string | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function utcTodayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toMonthlyAmount(input: SpendInput): number {
  if (input.status !== "active") return 0;
  const termEnd = input.termEndDateYmd?.trim();
  if (termEnd && termEnd < utcTodayYmd()) return 0;
  const amount = toAmount(input.amount);
  if (input.cadence === "yearly") return amount / 12;
  if (input.cadence === "quarterly") return amount / 3;
  return amount;
}

export function calculateTotals(entries: SpendInput[]) {
  const monthly = entries.reduce((sum, item) => sum + toMonthlyAmount(item), 0);
  return {
    monthly,
    yearly: monthly * 12,
  };
}

export function calculateTotalsByCurrency(entries: SpendByCurrencyInput[]) {
  const map = new Map<string, number>();
  for (const item of entries) {
    const currency = (item.currency ?? "USD").trim().toUpperCase() || "USD";
    const monthly = toMonthlyAmount(item);
    map.set(currency, (map.get(currency) ?? 0) + monthly);
  }

  return Array.from(map.entries())
    .map(([currency, monthly]) => ({ currency, monthly, yearly: monthly * 12 }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
