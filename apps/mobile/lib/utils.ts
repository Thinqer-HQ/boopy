import type { Cadence, Subscription } from "./types";

export const BRAND = "#6d5df6";
export const BRAND_LIGHT = "#efecfe";

export const COLORS = {
  brand: "#6d5df6",
  brandLight: "#efecfe",
  brandDark: "#5847e0",
  bg: "#f5f4fa",
  surface: "#ffffff",
  border: "#e8e5f4",
  text: "#17151f",
  muted: "#6b6882",
  subtle: "#9b98b0",
  green: "#1faa6b",
  greenBg: "#d1fae5",
  red: "#dc2626",
  redBg: "#fee2e2",
  yellow: "#d97706",
  yellowBg: "#fef3c7",
  blue: "#2563eb",
  blueBg: "#dbeafe",
};

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function toMonthly(amount: number, cadence: Cadence): number {
  switch (cadence) {
    case "weekly":
      return amount * 4.333;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
  }
}

export function toYearly(amount: number, cadence: Cadence): number {
  switch (cadence) {
    case "weekly":
      return amount * 52;
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "yearly":
      return amount;
  }
}

export function getTotalMonthly(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + toMonthly(s.amount, s.cadence), 0);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getRenewalLabel(dateStr: string | null): string {
  const days = daysUntil(dateStr);
  if (days === null) return "No renewal date";
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;
  return `Renews ${formatDate(dateStr)}`;
}

export function cadenceLabel(cadence: Cadence): string {
  const map: Record<Cadence, string> = {
    weekly: "/wk",
    monthly: "/mo",
    quarterly: "/qtr",
    yearly: "/yr",
  };
  return map[cadence];
}

export function getVendorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

const VENDOR_COLORS = [
  "#6d5df6",
  "#ec4899",
  "#f97316",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export function getVendorColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return VENDOR_COLORS[Math.abs(hash) % VENDOR_COLORS.length];
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
