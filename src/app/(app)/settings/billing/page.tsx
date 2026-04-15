"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { getPlanCapabilities } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function BillingSettingsPage() {
  const searchParams = useSearchParams();
  const { state } = usePrimaryWorkspace();
  const workspaceId = state.status === "ready" ? state.workspaceId : null;
  const billing = useWorkspaceBilling(workspaceId);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutResult = useMemo(() => searchParams.get("checkout"), [searchParams]);
  const capabilities = getPlanCapabilities(billing.plan);

  async function startCheckout() {
    if (!workspaceId) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    setLoadingCheckout(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setLoadingCheckout(false);
      setError("Sign in again before starting checkout.");
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ workspaceId }),
    });

    setLoadingCheckout(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Failed to create checkout session.");
      return;
    }

    const payload = (await response.json()) as { checkoutUrl?: string };
    if (!payload.checkoutUrl) {
      setError("Stripe checkout URL missing.");
      return;
    }

    window.location.href = payload.checkoutUrl;
  }

  if (state.status !== "ready") {
    if (state.status === "schema_not_ready") {
      return <SchemaNotReady details={state.details} />;
    }
    return <div className="text-muted-foreground p-8 text-sm">Loading billing…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Manage plan limits and upgrade your workspace to Pro.
        </p>
      </div>

      {checkoutResult === "success" ? (
        <Alert>
          <AlertTitle>Checkout complete</AlertTitle>
          <AlertDescription>
            Stripe checkout succeeded. Plan updates may take a few seconds to appear.
          </AlertDescription>
        </Alert>
      ) : null}

      {checkoutResult === "cancelled" ? (
        <Alert>
          <AlertTitle>Checkout cancelled</AlertTitle>
          <AlertDescription>No changes were made to your subscription.</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Current plan</CardTitle>
              <Badge variant={billing.plan === "pro" ? "default" : "secondary"}>
                {billing.plan.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>Status: {billing.status}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Clients:{" "}
              <span className="font-medium">
                {capabilities.maxClients >= 100000 ? "Unlimited" : capabilities.maxClients}
              </span>
            </p>
            <p>
              Subscriptions:{" "}
              <span className="font-medium">
                {capabilities.maxSubscriptions >= 100000
                  ? "Unlimited"
                  : capabilities.maxSubscriptions}
              </span>
            </p>
            <p>
              Push notifications:{" "}
              <span className="font-medium">
                {capabilities.pushEnabled ? "Enabled" : "Not included"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boopy Pro</CardTitle>
            <CardDescription>
              Unlimited clients and subscriptions with full reminder coverage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold">$19/mo</p>
            <p className="text-muted-foreground text-sm">
              Upgrade securely with Stripe. You can change/cancel from Stripe customer tools later.
            </p>
            <Button
              disabled={loadingCheckout || billing.plan === "pro"}
              onClick={() => void startCheckout()}
            >
              {billing.plan === "pro"
                ? "You are on Pro"
                : loadingCheckout
                  ? "Opening checkout…"
                  : "Upgrade to Pro"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
