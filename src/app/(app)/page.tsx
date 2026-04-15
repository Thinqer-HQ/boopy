"use client";

import { ArrowRight, Building2, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
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
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type ClientCountRow = { id: string };
type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number | string;
  currency: string;
  cadence: "monthly" | "yearly" | "custom";
  renewal_date: string;
  status: "active" | "paused" | "cancelled";
  clients: { name: string } | Array<{ name: string }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default function AppHome() {
  const { state, reload } = usePrimaryWorkspace();
  const [clients, setClients] = useState<ClientCountRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (state.status !== "ready") return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      setError(null);

      const [clientsResult, subscriptionsResult] = await Promise.all([
        supabase.from("clients").select("id").eq("workspace_id", state.workspaceId),
        supabase
          .from("subscriptions")
          .select(
            "id, vendor_name, amount, currency, cadence, renewal_date, status, clients!inner(name, workspace_id)"
          )
          .eq("clients.workspace_id", state.workspaceId)
          .order("renewal_date", { ascending: true }),
      ]);

      if (clientsResult.error) {
        setError(clientsResult.error.message);
        return;
      }
      if (subscriptionsResult.error) {
        setError(subscriptionsResult.error.message);
        return;
      }

      setClients((clientsResult.data ?? []) as ClientCountRow[]);
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
      const renewal = new Date(`${subscription.renewal_date}T00:00:00.000Z`);
      return renewal >= now && renewal <= cutoff;
    });
  }, [subscriptions]);

  const monthlyRunRate = useMemo(() => {
    return subscriptions
      .filter((subscription) => subscription.status === "active")
      .reduce((sum, subscription) => {
        const amount = Number(subscription.amount ?? 0);
        if (!Number.isFinite(amount)) return sum;
        if (subscription.cadence === "yearly") return sum + amount / 12;
        return sum + amount;
      }, 0);
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

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Live snapshot of clients, subscriptions, and renewals.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold">{clients.length}</div>
            <p className="text-muted-foreground text-xs">Customer accounts in this workspace</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-muted-foreground text-xs">
              Active monthly run-rate: ${monthlyRunRate.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (30d)</CardTitle>
            <Building2 className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold">{upcomingRenewals.length}</div>
            <p className="text-muted-foreground text-xs">Renewals in the next month</p>
          </CardContent>
        </Card>
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
                const client = first(subscription.clients);
                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{subscription.vendor_name}</p>
                      <p className="text-muted-foreground">
                        {client?.name ?? "Unknown client"} • {subscription.renewal_date}
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
              href="/clients"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Add or edit clients
              <ArrowRight className="size-4 opacity-70" />
            </Link>
            <Link
              href="/clients"
              className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
            >
              Add subscriptions
              <ArrowRight className="size-4 opacity-70" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
