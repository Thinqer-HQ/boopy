"use client";

import {
  ArrowRight,
  BarChart2,
  Bell,
  Calendar as CalendarIcon,
  CreditCard,
  DollarSign,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { calculateTotalsByCurrency, formatCurrency, toMonthlyAmount } from "@/lib/reports/spend";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import {
  recurrenceBoundsFromNullable,
  recurrenceOccurrenceDayKeysInUtcRange,
  type SubscriptionCadence,
} from "@/lib/subscriptions/recurrence";

type GroupCountRow = { id: string; name: string };

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
  groups: { name: string } | Array<{ name: string }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const QUICK_ACTIONS = [
  { href: "/groups", label: "Manage groups", icon: Users },
  { href: "/subscriptions", label: "Add subscription", icon: CreditCard },
  { href: "/documents", label: "Upload receipt", icon: FileText },
  { href: "/reports", label: "View reports", icon: BarChart2 },
  { href: "/notifications", label: "Notification settings", icon: Bell },
] as const;

export default function AppHome() {
  const { state, reload } = usePrimaryWorkspace();
  const [groups, setGroups] = useState<GroupCountRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (state.status !== "ready") return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      setError(null);

      const [groupsResult, subscriptionsResult] = await Promise.all([
        supabase.from("groups").select("id, name").eq("workspace_id", state.workspaceId),
        supabase
          .from("subscriptions")
          .select(
            "id, vendor_name, amount, currency, cadence, renewal_date, start_date, end_date, status, groups!inner(name, workspace_id)"
          )
          .eq("groups.workspace_id", state.workspaceId)
          .order("renewal_date", { ascending: true }),
      ]);

      if (groupsResult.error) {
        setError(groupsResult.error.message);
        return;
      }
      if (subscriptionsResult.error) {
        setError(subscriptionsResult.error.message);
        return;
      }

      setGroups((groupsResult.data ?? []) as GroupCountRow[]);
      setSubscriptions((subscriptionsResult.data ?? []) as SubscriptionRow[]);
    }

    queueMicrotask(() => {
      void load();
    });
  }, [state]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return subscriptions.filter((subscription) => {
      if (subscription.status !== "active") return false;
      const bounds = recurrenceBoundsFromNullable(subscription.start_date, subscription.end_date);
      const keys = recurrenceOccurrenceDayKeysInUtcRange(
        subscription.renewal_date,
        subscription.cadence,
        now,
        cutoff,
        bounds
      );
      return keys.length > 0;
    });
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
    const map = new Map<string, Map<string, number>>();
    for (const subscription of subscriptions) {
      if (subscription.status !== "active") continue;
      const group = first(subscription.groups);
      const groupName = group?.name ?? "Unknown";
      const amount = Number(subscription.amount ?? 0);
      if (!Number.isFinite(amount)) continue;
      const monthlyAmount = toMonthlyAmount({
        amount: subscription.amount,
        cadence: subscription.cadence,
        status: subscription.status,
        termEndDateYmd: subscription.end_date,
      });
      const currency = (subscription.currency ?? "USD").toUpperCase();
      const currentGroup = map.get(groupName) ?? new Map<string, number>();
      currentGroup.set(currency, (currentGroup.get(currency) ?? 0) + monthlyAmount);
      map.set(groupName, currentGroup);
    }
    return Array.from(map.entries())
      .map(([name, totals]) => {
        const buckets = Array.from(totals.entries())
          .map(([currency, monthly]) => ({ currency, monthly }))
          .sort((a, b) => a.currency.localeCompare(b.currency));
        return {
          name,
          buckets,
          monthlyAll: buckets.reduce((sum, bucket) => sum + bucket.monthly, 0),
        };
      })
      .sort((a, b) => b.monthlyAll - a.monthlyAll);
  }, [subscriptions]);

  if (state.status === "not_configured") {
    return <MissingSupabaseConfig />;
  }

  if (state.status === "loading") {
    return <div className="text-muted-foreground p-8 text-sm">Loading dashboard…</div>;
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
          <Image
            src="/boopy-assets/boopy-chill.png"
            alt=""
            width={100}
            height={100}
            className="hidden shrink-0 select-none sm:block"
            draggable={false}
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
                ? `${activeCount} active subscription${activeCount !== 1 ? "s" : ""}${upcomingRenewals.length > 0 ? ` · ${upcomingRenewals.length} renewal${upcomingRenewals.length !== 1 ? "s" : ""} in 30 days` : ""} · all reminders armed.`
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pt-4 pb-1">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Monthly
            </CardTitle>
            <DollarSign className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="font-heading text-3xl font-semibold">
              {primaryMonthly > 0 ? formatCurrency(primaryMonthly, primaryCurrency) : "—"}
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {primaryYearly > 0
                ? `${formatCurrency(primaryYearly, primaryCurrency)}/yr`
                : "no active subs"}
            </p>
          </CardContent>
        </Card>

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
              <p className="text-muted-foreground mt-0.5 text-xs">renewals in 30 days</p>
            </CardContent>
          </Card>
        </Link>
      </div>

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
            <CardDescription>Active subscriptions renewing in the next 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingRenewals.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No upcoming renewals. Add subscriptions to start seeing reminders.
              </p>
            ) : (
              <div className="-mx-1">
                {upcomingRenewals.slice(0, 8).map((subscription) => {
                  const group = first(subscription.groups);
                  return (
                    <div
                      key={subscription.id}
                      className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{subscription.vendor_name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {group?.name ?? "Unknown group"} · {subscription.renewal_date}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums">
                        {Number(subscription.amount ?? 0).toFixed(2)}{" "}
                        <span className="text-muted-foreground font-normal">
                          {subscription.currency}
                        </span>
                      </p>
                    </div>
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
                <span className="flex items-center gap-2">
                  <ActionIcon className="size-4 opacity-60" />
                  {label}
                </span>
                <ArrowRight className="size-4 opacity-50" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
