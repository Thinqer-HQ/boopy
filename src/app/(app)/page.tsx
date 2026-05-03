"use client";

import { ArrowRight, Building2, CreditCard, Users } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { calculateTotalsByCurrency, formatCurrency, toMonthlyAmount } from "@/lib/reports/spend";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import {
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
  status: "active" | "paused" | "cancelled";
  groups: { name: string } | Array<{ name: string }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

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
            "id, vendor_name, amount, currency, cadence, renewal_date, status, groups!inner(name, workspace_id)"
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
      const keys = recurrenceOccurrenceDayKeysInUtcRange(
        subscription.renewal_date,
        subscription.cadence,
        now,
        cutoff
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

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Live snapshot of groups, subscriptions, and renewal automation.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/groups" className="block">
          <Card className="hover:bg-muted/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Groups</CardTitle>
              <Users className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold">{groups.length}</div>
              <p className="text-muted-foreground text-xs">Custom subscription buckets</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/subscriptions" className="block">
          <Card className="hover:bg-muted/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <CreditCard className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold">{subscriptions.length}</div>
              <div className="text-muted-foreground text-xs">
                {totalsByCurrency.length === 0 ? (
                  <p>Monthly spend: no active subscriptions.</p>
                ) : (
                  totalsByCurrency.map((bucket) => (
                    <p key={bucket.currency}>
                      {bucket.currency}: {formatCurrency(bucket.monthly, bucket.currency)}
                    </p>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/calendar" className="block sm:col-span-2 lg:col-span-1">
          <Card className="hover:bg-muted/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming (30d)</CardTitle>
              <Building2 className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold">{upcomingRenewals.length}</div>
              <p className="text-muted-foreground text-xs">Renewals in the next month</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Upcoming renewals</CardTitle>
              <Badge variant="secondary">MVP</Badge>
            </div>
            <CardDescription>
              Focus list of active subscriptions renewing in the next 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingRenewals.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No upcoming renewals. Add subscriptions to start seeing reminders.
              </p>
            ) : (
              upcomingRenewals.slice(0, 8).map((subscription) => {
                const group = first(subscription.groups);
                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{subscription.vendor_name}</p>
                      <p className="text-muted-foreground">
                        {group?.name ?? "Unknown group"} • {subscription.renewal_date}
                      </p>
                    </div>
                    <p className="font-medium">
                      {Number(subscription.amount ?? 0).toFixed(2)} {subscription.currency}
                    </p>
                  </div>
                );
              })
            )}
            <Separator />
            <p className="text-muted-foreground text-xs">
              Set lead times in notification settings to control email reminders.
            </p>
            <div className="flex flex-wrap gap-2">
              {groupTotals.slice(0, 8).map((groupTotal) => (
                <Badge key={groupTotal.name} variant="outline">
                  {groupTotal.name}:{" "}
                  {groupTotal.buckets
                    .map(
                      (bucket) =>
                        `${bucket.currency} ${formatCurrency(bucket.monthly, bucket.currency)}`
                    )
                    .join(" • ")}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href="/settings/notifications"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              Notification settings
              <ArrowRight className="size-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Fast paths for daily operations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              href="/groups"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Manage groups
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/subscriptions"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Add subscriptions
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/reports"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Open reports
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/documents"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Upload receipts
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/notifications"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Open notifications
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/calendar"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Sync Google Calendar
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/settings/notifications"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Sync Slack
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/settings/notifications"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Sync Discord
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/settings/notifications"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Sync Email
              <ArrowRight className="size-4 opacity-70" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total spending</CardTitle>
          <CardDescription>Single-glance KPI across all active subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Monthly total</p>
            <div className="space-y-1">
              {totalsByCurrency.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active subscriptions.</p>
              ) : (
                totalsByCurrency.map((bucket) => (
                  <p
                    key={`monthly-${bucket.currency}`}
                    className="font-heading text-xl font-semibold"
                  >
                    {bucket.currency} {formatCurrency(bucket.monthly, bucket.currency)}
                  </p>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Yearly total</p>
            <div className="space-y-1">
              {totalsByCurrency.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active subscriptions.</p>
              ) : (
                totalsByCurrency.map((bucket) => (
                  <p
                    key={`yearly-${bucket.currency}`}
                    className="font-heading text-xl font-semibold"
                  >
                    {bucket.currency} {formatCurrency(bucket.yearly, bucket.currency)}
                  </p>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
