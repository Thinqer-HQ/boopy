const API_URL = process.env.BOOPY_API_URL ?? "https://www.useboopy.com";
const ADMIN_SECRET = process.env.BOOPY_ADMIN_SECRET ?? "";

async function adminFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "x-admin-secret": ADMIN_SECRET },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin API error ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

export interface StatsResponse {
  generatedAt: string;
  users: { total: number; pro: number; free: number; activeTrial: number };
  workspaces: { total: number };
  subscriptions: { total: number; active: number };
}

export interface UserSummary {
  userId: string;
  email: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
  plan: "free" | "pro";
  billingStatus: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionCount: number;
  activeSubscriptionCount: number;
  groupCount: number;
  joinedAt: string | null;
}

export interface UsersResponse {
  data: UserSummary[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface Subscription {
  id: string;
  vendorName: string;
  amount: number;
  currency: string;
  cadence: string;
  status: string;
  groupName: string | null;
  renewalDate: string | null;
  createdAt: string | null;
}

export interface UserDetail extends UserSummary {
  subscriptions: Subscription[];
}

export interface NotificationsResponse {
  jobs: { pending: number; sent24h: number; failedTotal: number };
  digests: { pending: number; failed: number };
  recentFailures: Array<{
    workspaceId: string;
    workspaceName: string | null;
    channel: string;
    error: string | null;
    attemptCount: number;
    updatedAt: string;
  }>;
}

export interface Alert {
  type: "churned_pro" | "near_free_limit";
  workspaceId: string;
  workspaceName: string | null;
  email: string | null;
  detail: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  counts: { churnedPro: number; nearFreeLimit: number };
}

export const api = {
  stats: () => adminFetch<StatsResponse>("/api/admin/stats"),
  users: (page = 1, pageSize = 50, plan?: string) => {
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (plan) q.set("plan", plan);
    return adminFetch<UsersResponse>(`/api/admin/users?${q}`);
  },
  user: (userId: string) => adminFetch<UserDetail>(`/api/admin/users/${userId}`),
  notifications: () => adminFetch<NotificationsResponse>("/api/admin/notifications"),
  alerts: () => adminFetch<AlertsResponse>("/api/admin/alerts"),
};
