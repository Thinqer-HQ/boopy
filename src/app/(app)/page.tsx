"use client";

import {
  ArrowRight,
  BarChart2,
  Bell,
  Calendar as CalendarIcon,
  CreditCard,
  FileText,
  Inbox,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BoopyLottieMascot } from "@/components/boopy/boopy-lottie-mascot";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { getBoopyEmotionState } from "@/lib/boopy/emotion-state";
import { calculateTotalsByCurrency, formatCurrency, toMonthlyAmount } from "@/lib/reports/spend";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import {
  nextOccurrenceDayKeyOnOrAfter,
  recurrenceBoundsFromNullable,
  type SubscriptionCadence,
} from "@/lib/subscriptions/recurrence";

type GroupRow = { id: string; name: string };

type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number | string;
  currency: string;
  cadence: SubscriptionCadence;
  renewal_date: string;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "paused" | "cancelled";
  groups: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const GROUP_COLORS = ["#6d5df6", "#1faa6b", "#e8843c", "#3a93ee", "#f1465a", "#8b7cf8"];

function GroupCard({
  groupId,
  name,
  buckets,
  subCount,
  colorIndex,
}: {
  groupId: string;
  name: string;
  buckets: Array<{ currency: string; monthly: number }>;
  subCount: number;
  colorIndex: number;
}) {
  const color = GROUP_COLORS[colorIndex % GROUP_COLORS.length] ?? GROUP_COLORS[0];
  const top = buckets[0];
  return (
    <Link href={`/subscriptions?group=${groupId}`} className="cursor-pointer">
      <Card className="overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="h-1.5 w-full" style={{ background: color }} />
        <div className="p-4">
          <p className="truncate font-semibold">{name}</p>
          <div className="font-heading mt-2 text-2xl leading-none font-semibold">
            {top ? formatCurrency(top.monthly, top.currency) : "—"}
            <span className="text-muted-foreground text-sm font-normal">/mo</span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {subCount} subscription{subCount !== 1 ? "s" : ""}
          </p>
        </div>
      </Card>
    </Link>
  );
}

const QUICK_ACTIONS = [
  { href: "/subscriptions?addGroup=1", label: "Manage groups", icon: Users },
  { href: "/subscriptions", label: "Add subscription", icon: CreditCard },
  { href: "/documents", label: "Upload receipt", icon: FileText },
  { href: "/reports", label: "View reports", icon: BarChart2 },
  { href: "/notifications", label: "Notification settings", icon: Bell },
] as const;

export default function AppHome() {
  const { state, reload } = usePrimaryWorkspace();
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingDrafts, setPendingDrafts] = useState(0);

  useEffect(() => {
    async function load() {
      if (state.status !== "ready") return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      setError(null);

      const [groupsResult, subscriptionsResult, draftsResult] = await Promise.all([
        supabase.from("groups").select("id, name").eq("workspace_id", state.workspaceId),
        supabase
          .from("subscriptions")
          .select(
            "id, vendor_name, amount, currency, cadence, renewal_date, start_date, end_date, status, groups!inner(id, name, workspace_id)"
          )
          .eq("groups.workspace_id", state.workspaceId)
          .order("renewal_date", { ascending: true }),
        supabase
          .from("subscription_drafts")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", state.workspaceId)
          .eq("status", "pending"),
      ]);

      if (groupsResult.error) {
        setError(groupsResult.error.message);
        return;
      }
      if (subscriptionsResult.error) {
        setError(subscriptionsResult.error.message);
        return;
      }

      setGroups((groupsResult.data ?? []) as GroupRow[]);
      setSubscriptions((subscriptionsResult.data ?? []) as SubscriptionRow[]);
      setPendingDrafts(draftsResult.count ?? 0);
    }

    queueMicrotask(() => {
      void load();
    });
  }, [state]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    // End of next calendar month (this month + next month)
    const endOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0, 23, 59, 59, 999)
    );
    const result: Array<{ sub: SubscriptionRow; nextDate: string }> = [];
    for (const sub of subscriptions) {
      if (sub.status !== "active") continue;
      const bounds = recurrenceBoundsFromNullable(sub.start_date, sub.end_date);
      const nextDate = nextOccurrenceDayKeyOnOrAfter(sub.renewal_date, sub.cadence, now, bounds);
      if (!nextDate) continue;
      const nextDateUtc = new Date(`${nextDate}T00:00:00.000Z`);
      if (nextDateUtc > endOfNextMonth) continue;
      result.push({ sub, nextDate });
    }
    return result.sort((a, b) => (a.nextDate < b.nextDate ? -1 : a.nextDate > b.nextDate ? 1 : 0));
  }, [subscriptions]);

  const totalsByCurrency = useMemo(
    () =>
      calculateTotalsByCurrency(
        subscriptions.map((subscription) => ({
          amount: subscription.amount,
          cadence: subscription.cadence,
          status: subscription.status,
          currency: subscription.currency,
          termEndDateYmd: subscription.end_date,
        }))
      ),
    [subscriptions]
  );

  const groupTotals = useMemo(() => {
    const map = new Map<string, { id: string; totals: Map<string, number> }>();
    for (const subscription of subscriptions) {
      if (subscription.status !== "active") continue;
      const group = first(subscription.groups);
      if (!group) continue;
      const amount = Number(subscription.amount ?? 0);
      if (!Number.isFinite(amount)) continue;
      const monthlyAmount = toMonthlyAmount({
        amount: subscription.amount,
        cadence: subscription.cadence,
        status: subscription.status,
        termEndDateYmd: subscription.end_date,
      });
      const currency = (subscription.currency ?? "USD").toUpperCase();
      const entry = map.get(group.name) ?? { id: group.id, totals: new Map<string, number>() };
      entry.totals.set(currency, (entry.totals.get(currency) ?? 0) + monthlyAmount);
      map.set(group.name, entry);
    }
    return Array.from(map.entries())
      .map(([name, { id, totals }]) => {
        const buckets = Array.from(totals.entries())
          .map(([currency, monthly]) => ({ currency, monthly }))
          .sort((a, b) => a.currency.localeCompare(b.currency));
        return {
          id,
          name,
          buckets,
          monthlyAll: buckets.reduce((sum, bucket) => sum + bucket.monthly, 0),
        };
      })
      .sort((a, b) => b.monthlyAll - a.monthlyAll);
  }, [subscriptions]);

  const groupSubCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const sub of subscriptions) {
      if (sub.status !== "active") continue;
      const name = first(sub.groups)?.name ?? "Unknown";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return counts;
  }, [subscriptions]);

  if (state.status === "not_configured") {
    return <MissingSupabaseConfig />;
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-[110px] w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pt-4 pb-1">
                <Skeleton className="h-3 w-20" />
              </CardHeader>
              <CardContent className="pb-4">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="mt-1.5 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Could not load workspace</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => void reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (state.status === "schema_not_ready") {
    return <SchemaNotReady details={state.details} />;
  }

  const primaryCurrency = totalsByCurrency[0]?.currency ?? "USD";
  const primaryMonthly = totalsByCurrency[0]?.monthly ?? 0;
  const primaryYearly = totalsByCurrency[0]?.yearly ?? 0;
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const pausedCount = subscriptions.filter((s) => s.status === "paused").length;
  const heroEmotion = getBoopyEmotionState({
    inSavingsMode: pausedCount > 0,
    everythingOnTrack: activeCount > 0,
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── Hero banner ── */}
      <div className="from-accent to-card border-accent overflow-hidden rounded-3xl border bg-gradient-to-r">
        <div className="flex items-center gap-4 p-5 sm:gap-6 sm:p-7">
          <BoopyLottieMascot
            className="relative hidden size-[100px] shrink-0 select-none sm:block"
            emotion={heroEmotion}
            reducedMotionBehavior="fallback-image"
            priority
          />
          <div className="min-w-0 flex-1">
            <p className="text-primary mb-0.5 text-[11px] font-bold tracking-widest uppercase">
              {today}
            </p>
            <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              {primaryMonthly > 0
                ? `Managing ${formatCurrency(primaryMonthly, primaryCurrency)}/mo across ${groups.length} group${groups.length !== 1 ? "s" : ""}.`
                : "Welcome to Boopy."}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {activeCount > 0
                ? `${activeCount} active subscription${activeCount !== 1 ? "s" : ""}${upcomingRenewals.length > 0 ? ` · ${upcomingRenewals.length} renewal${upcomingRenewals.length !== 1 ? "s" : ""} this or next month` : ""} · all reminders armed.`
                : "Add your first subscription to get started."}
            </p>
          </div>
          <Button
            className="ml-auto hidden shrink-0 gap-2 shadow-[0_8px_18px_rgba(109,93,246,0.32)] sm:flex"
            onClick={() => window.dispatchEvent(new CustomEvent("boopy:openChat"))}
          >
            <Sparkles className="size-4" />
            Ask Boopy
          </Button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/groups">
          <Card className="hover:bg-accent/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pt-4 pb-1">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Groups
              </CardTitle>
              <Users className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="font-heading text-3xl font-semibold">{groups.length}</div>
              <p className="text-muted-foreground mt-0.5 text-xs">cost centers</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/subscriptions">
          <Card className="hover:bg-accent/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pt-4 pb-1">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Subscriptions
              </CardTitle>
              <CreditCard className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="font-heading text-3xl font-semibold">{activeCount}</div>
              <p className="text-muted-foreground mt-0.5 text-xs">active</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/subscriptions">
          <Card className="from-primary/8 to-primary/4 border-primary/20 bg-gradient-to-br transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pt-4 pb-1">
              <CardTitle className="text-primary text-xs font-semibold tracking-wide uppercase">
                Monthly
              </CardTitle>
              <TrendingUp className="text-primary size-4" />
            </CardHeader>
            <CardContent className="pb-4">
              {totalsByCurrency.length === 0 ? (
                <div className="font-heading text-primary text-3xl font-semibold">—</div>
              ) : (
                <>
                  <div className="font-heading text-primary text-3xl font-semibold">
                    {formatCurrency(totalsByCurrency[0]!.monthly, totalsByCurrency[0]!.currency)}
                  </div>
                  {totalsByCurrency.length > 1 && (
                    <div className="mt-1 flex flex-col gap-0">
                      {totalsByCurrency.slice(1).map((t) => (
                        <p key={t.currency} className="text-muted-foreground text-xs tabular-nums">
                          +{formatCurrency(t.monthly, t.currency)} {t.currency}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatCurrency(totalsByCurrency[0]!.yearly, totalsByCurrency[0]!.currency)}/yr
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="hover:bg-accent/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pt-4 pb-1">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Upcoming
              </CardTitle>
              <CalendarIcon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="font-heading text-3xl font-semibold">{upcomingRenewals.length}</div>
              <p className="text-muted-foreground mt-0.5 text-xs">this &amp; next month</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Groups grid ── */}
      {groupTotals.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Your groups</h2>
            <Link
              href="/subscriptions"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-primary text-xs"
              )}
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {groupTotals.slice(0, 5).map((g, i) => (
              <GroupCard
                key={g.name}
                groupId={g.id}
                name={g.name}
                buckets={g.buckets}
                subCount={groupSubCounts.get(g.name) ?? 0}
                colorIndex={i}
              />
            ))}
            <Link
              href="/subscriptions?addGroup=1"
              className="border-border/60 hover:bg-muted/40 flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed transition-colors"
            >
              <span className="bg-accent text-accent-foreground flex size-9 items-center justify-center rounded-xl">
                <Plus className="size-4" />
              </span>
              <span className="text-muted-foreground text-sm font-medium">New group</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming renewals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming renewals</CardTitle>
              <Link
                href="/calendar"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-primary text-xs"
                )}
              >
                Calendar →
              </Link>
            </div>
            <CardDescription>
              Active subscriptions renewing this month or next month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingRenewals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
                  <CalendarIcon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">All clear for 30 days</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    No renewals coming up. Add subscriptions to track them here.
                  </p>
                </div>
                <Link
                  href="/subscriptions"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-1 gap-1.5")}
                >
                  <Plus className="size-3.5" />
                  Add subscription
                </Link>
              </div>
            ) : (
              <div className="-mx-1">
                {upcomingRenewals.slice(0, 8).map(({ sub, nextDate }) => {
                  const group = first(sub.groups);
                  return (
                    <Link
                      key={sub.id}
                      href={`/calendar?date=${nextDate}`}
                      className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{sub.vendor_name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {group?.name ?? "Unknown group"} · {nextDate}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums">
                        {Number(sub.amount ?? 0).toFixed(2)}{" "}
                        <span className="text-muted-foreground font-normal">{sub.currency}</span>
                      </p>
                    </Link>
                  );
                })}
                {upcomingRenewals.length > 8 && (
                  <p className="text-muted-foreground mt-2 px-3 text-xs">
                    +{upcomingRenewals.length - 8} more ·{" "}
                    <Link
                      href="/calendar"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      see all
                    </Link>
                  </p>
                )}
              </div>
            )}
          </CardContent>
          {groupTotals.length > 0 && (
            <CardFooter className="flex-wrap gap-2 border-t pt-4">
              {groupTotals.slice(0, 5).map((groupTotal) => (
                <Badge key={groupTotal.name} variant="secondary">
                  {groupTotal.name}:{" "}
                  {groupTotal.buckets
                    .map((b) => `${b.currency} ${formatCurrency(b.monthly, b.currency)}`)
                    .join(" · ")}
                </Badge>
              ))}
            </CardFooter>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Fast paths for daily operations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {QUICK_ACTIONS.map(({ href, label, icon: ActionIcon }) => (
              <Link
                key={href}
                href={href}
                className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
              >
                <span className="flex items-center gap-2.5">
                  <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md">
                    <ActionIcon className="size-3.5" />
                  </span>
                  {label}
                </span>
                <ArrowRight className="size-4 opacity-40" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
      {/* ── Drive inbox ── */}
      {pendingDrafts > 0 && (
        <Link href="/notifications">
          <Card className="border-amber-200 bg-amber-50/60 transition-shadow hover:shadow-md dark:border-amber-800/40 dark:bg-amber-900/10">
            <CardContent className="flex items-center gap-4 py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                <Inbox className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  {pendingDrafts} receipt{pendingDrafts !== 1 ? "s" : ""} waiting in inbox
                </p>
                <p className="mt-0.5 text-xs text-amber-700/70 dark:text-amber-400/70">
                  Boopy found new files in your Google Drive. Review and confirm them.
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-amber-500" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* ── Savings mode ── */}
      {pausedCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-accent text-accent-foreground flex size-6 items-center justify-center rounded-lg">
                <Sparkles className="size-3.5" />
              </span>
              <CardTitle className="text-base">Savings mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {pausedCount} paused subscription{pausedCount !== 1 ? "s" : ""}. Review and cancel
              anything you no longer need.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-2"
              onClick={() => window.dispatchEvent(new CustomEvent("boopy:openChat"))}
            >
              <Sparkles className="size-3.5" />
              Review with Boopy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
