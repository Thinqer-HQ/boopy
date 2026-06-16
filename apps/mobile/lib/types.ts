export type Cadence = "weekly" | "monthly" | "quarterly" | "yearly";
export type SubStatus = "active" | "paused" | "canceled";

export interface Group {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  synced: number;
  deleted: number;
}

export interface Subscription {
  id: string;
  group_id: string | null;
  vendor_name: string;
  amount: number;
  currency: string;
  cadence: Cadence;
  renewal_date: string | null;
  status: SubStatus;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  deleted: number;
}

export interface AppSettings {
  default_currency: string;
  notifications_enabled: string;
  user_id: string | null;
  last_synced: string | null;
}

export type NewSubscription = Omit<
  Subscription,
  "id" | "created_at" | "updated_at" | "synced" | "deleted"
>;

export const CURRENCIES = ["USD", "EUR", "GBP", "PHP", "SGD", "AUD", "CAD", "JPY", "INR", "MXN"];

export const CADENCE_LABELS: Record<Cadence, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const CATEGORIES = [
  "Streaming",
  "Software",
  "Cloud Storage",
  "Music",
  "Gaming",
  "News & Media",
  "Fitness",
  "Education",
  "Business",
  "Finance",
  "Communication",
  "Other",
];
