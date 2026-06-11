"use client";

import { Check, ChevronDown, ChevronUp, Loader2, Sparkles, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { getPlanCapabilities } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const MONTHLY_PRICE = 19;
const ANNUAL_PRICE = 15;
const ORIGINAL_PRICE = 29;

const FREE_FEATURES = [
  "Up to 3 subscriptions",
  "1 group",
  "Email renewal reminders",
  "Basic renewal calendar",
];

const PRO_FEATURES = [
  "Unlimited subscriptions & groups",
  "Multi-currency tracking",
  "Boopy AI Assistant",
  "Push + email reminders",
  "Receipt scanning via Google Drive",
  "Renewal calendar",
  "Google Calendar sync",
  "Slack, Discord & webhook alerts",
  "Priority support",
];

type BillingInterval = "monthly" | "annual";

type BillingInfo = {
  interval: BillingInterval | "unknown" | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  annualAvailable: boolean;
  status: string | null;
};

type SwitchPreview = {
  amountDue: number;
  currency: string;
  periodEnd: string;
  prorationDate: number;
};

function formatCents(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {included ? (
        <Check className="text-primary mt-0.5 size-3.5 shrink-0" />
      ) : (
        <X className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
      )}
      <span className={cn("text-sm", !included && "text-muted-foreground")}>{label}</span>
    </div>
  );
}

function IntervalToggle({
  value,
  onChange,
  disabled,
}: {
  value: BillingInterval;
  onChange: (v: BillingInterval) => void;
  disabled?: boolean;
}) {
  const isMonthly = value === "monthly";
  const isAnnual = value === "annual";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        borderRadius: "9999px",
        border: "1.5px solid var(--border)",
        padding: "3px",
        background: "var(--card)",
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("monthly")}
        style={{
          borderRadius: "9999px",
          padding: "6px 18px",
          fontSize: "14px",
          fontWeight: 600,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          background: isMonthly ? "var(--primary)" : "transparent",
          color: isMonthly ? "var(--primary-foreground)" : "var(--muted-foreground)",
          boxShadow: isMonthly ? "0 1px 6px rgba(109,93,246,0.3)" : "none",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        Monthly
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("annual")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          borderRadius: "9999px",
          padding: "6px 18px",
          fontSize: "14px",
          fontWeight: 600,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          background: isAnnual ? "var(--primary)" : "transparent",
          color: isAnnual ? "var(--primary-foreground)" : "var(--primary)",
          boxShadow: isAnnual ? "0 1px 6px rgba(109,93,246,0.3)" : "none",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        Annual
        <span
          style={{
            borderRadius: "9999px",
            padding: "2px 7px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            transition: "all 0.15s ease",
            background: isAnnual ? "rgba(255,255,255,0.22)" : "var(--accent)",
            color: isAnnual ? "#fff" : "var(--primary)",
          }}
        >
          Save 20%
        </span>
      </button>
    </div>
  );
}

export default function BillingSettingsPage() {
  const searchParams = useSearchParams();
  const { state, reload } = usePrimaryWorkspace();
  const workspaceId = state.status === "ready" ? state.workspaceId : null;
  const billing = useWorkspaceBilling(workspaceId);
  const { refetch: refetchBilling } = billing;

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotionCode, setPromotionCode] = useState("");
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [featuresOpen, setFeaturesOpen] = useState(false);

  // For Pro users: current billing details
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loadingBillingInfo, setLoadingBillingInfo] = useState(false);

  // Switch-to-annual flow
  const [switchPreview, setSwitchPreview] = useState<SwitchPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState(false);

  const checkoutResult = useMemo(() => searchParams.get("checkout"), [searchParams]);
  const capabilities = getPlanCapabilities(billing.plan);

  // Poll for plan upgrade after checkout
  useEffect(() => {
    if (checkoutResult !== "success") return;
    if (billing.plan === "pro") return;
    let polls = 0;
    const id = window.setInterval(() => {
      polls += 1;
      void refetchBilling();
      if (polls >= 24) window.clearInterval(id);
    }, 1500);
    return () => window.clearInterval(id);
  }, [checkoutResult, billing.plan, refetchBilling]);

  // Fetch billing info for Pro users
  const loadBillingInfo = useCallback(async () => {
    if (!workspaceId || billing.plan !== "pro") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    setLoadingBillingInfo(true);
    const res = await fetch(`/api/stripe/billing-info?workspaceId=${workspaceId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setLoadingBillingInfo(false);
    if (!res.ok) return;
    const data = (await res.json()) as BillingInfo;
    setBillingInfo(data);
  }, [workspaceId, billing.plan]);

  useEffect(() => {
    void loadBillingInfo();
  }, [loadBillingInfo]);

  async function getToken() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function startCheckout() {
    if (!workspaceId) return;
    const token = await getToken();
    if (!token) {
      setError("Sign in again before starting checkout.");
      return;
    }
    setLoadingCheckout(true);
    setError(null);
    const code = promotionCode.trim();
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ workspaceId, interval, ...(code ? { promotionCode: code } : {}) }),
    });
    setLoadingCheckout(false);
    if (!res.ok) {
      const p = (await res.json().catch(() => ({}))) as { error?: string };
      setError(p.error ?? "Failed to create checkout session.");
      return;
    }
    const p = (await res.json()) as { checkoutUrl?: string };
    if (!p.checkoutUrl) {
      setError("Stripe checkout URL missing.");
      return;
    }
    window.location.href = p.checkoutUrl;
  }

  async function openPortal() {
    if (!workspaceId) return;
    const token = await getToken();
    if (!token) {
      setError("Sign in again before opening the billing portal.");
      return;
    }
    setLoadingPortal(true);
    setError(null);
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ workspaceId }),
    });
    setLoadingPortal(false);
    if (!res.ok) {
      const p = (await res.json().catch(() => ({}))) as { error?: string };
      setError(p.error ?? "Failed to open Stripe billing portal.");
      return;
    }
    const p = (await res.json()) as { portalUrl?: string };
    if (!p.portalUrl) {
      setError("Stripe portal URL missing.");
      return;
    }
    window.location.href = p.portalUrl;
  }

  async function previewSwitch() {
    if (!workspaceId) return;
    const token = await getToken();
    if (!token) return;
    setLoadingPreview(true);
    setError(null);
    const res = await fetch(`/api/stripe/switch-interval?workspaceId=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoadingPreview(false);
    if (!res.ok) {
      const p = (await res.json().catch(() => ({}))) as { error?: string };
      setError(p.error ?? "Failed to preview switch.");
      return;
    }
    const data = (await res.json()) as SwitchPreview;
    setSwitchPreview(data);
  }

  async function confirmSwitch() {
    if (!workspaceId || !switchPreview) return;
    const token = await getToken();
    if (!token) return;
    setSwitching(true);
    setError(null);
    const res = await fetch("/api/stripe/switch-interval", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ workspaceId, prorationDate: switchPreview.prorationDate }),
    });
    setSwitching(false);
    if (!res.ok) {
      const p = (await res.json().catch(() => ({}))) as { error?: string };
      setError(p.error ?? "Failed to switch to annual.");
      return;
    }
    setSwitchPreview(null);
    setSwitchSuccess(true);
    void loadBillingInfo();
    void refetchBilling();
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
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
  if (state.status === "empty") {
    return (
      <div className="p-8">
        <Alert>
          <AlertTitle>No workspace yet</AlertTitle>
          <AlertDescription>
            Open the dashboard once while signed in so Boopy can create your workspace.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (state.status !== "ready") {
    return <div className="text-muted-foreground p-8 text-sm">Loading billing…</div>;
  }

  const isMonthlyPro =
    billing.plan === "pro" &&
    (billingInfo?.interval === "monthly" || billingInfo?.interval === "unknown");
  const isAnnualPro = billing.plan === "pro" && billingInfo?.interval === "annual";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm">Manage your plan and subscription.</p>
      </div>

      {checkoutResult === "success" && (
        <Alert>
          <AlertTitle>Checkout complete</AlertTitle>
          <AlertDescription>
            Your plan refreshes automatically — this can take a few seconds after payment.
          </AlertDescription>
        </Alert>
      )}
      {checkoutResult === "cancelled" && (
        <Alert>
          <AlertTitle>Checkout cancelled</AlertTitle>
          <AlertDescription>No changes were made.</AlertDescription>
        </Alert>
      )}
      {switchSuccess && (
        <Alert>
          <AlertTitle>Switched to Annual</AlertTitle>
          <AlertDescription>
            You&apos;re now on annual billing. A prorated charge for the remaining year was applied.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Current plan card ── */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle>Current plan</CardTitle>
              <Badge variant={billing.plan === "pro" ? "default" : "secondary"}>
                {billing.plan.toUpperCase()}
              </Badge>
              {billingInfo?.interval && billingInfo.interval !== "unknown" && (
                <Badge variant="outline" className="text-xs capitalize">
                  {billingInfo.interval}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <p>
                Subscriptions:{" "}
                <span className="font-medium">
                  {capabilities.maxSubscriptions >= 100000
                    ? "Unlimited"
                    : capabilities.maxSubscriptions}
                </span>
              </p>
              <p>
                Groups:{" "}
                <span className="font-medium">
                  {capabilities.maxClients >= 100000 ? "Unlimited" : capabilities.maxClients}
                </span>
              </p>
              <p>
                Push notifications:{" "}
                <span className="font-medium">
                  {capabilities.pushEnabled ? "Enabled" : "Not included"}
                </span>
              </p>
              <p>
                Boopy AI:{" "}
                <span className="font-medium">
                  {capabilities.boopyAssistant ? "Included" : "Pro only"}
                </span>
              </p>
            </div>

            {billingInfo?.currentPeriodEnd && (
              <p className="text-muted-foreground border-t pt-1 text-xs">
                {billingInfo.trialEnd
                  ? `Trial ends ${new Date(billingInfo.trialEnd).toLocaleDateString()}`
                  : `Next renewal ${new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            )}

            {billing.plan === "pro" && (
              <Button
                variant="outline"
                size="sm"
                disabled={loadingPortal}
                onClick={() => void openPortal()}
              >
                {loadingPortal && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                {loadingPortal ? "Opening…" : "Manage / Cancel"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ── Pro upgrade / management card ── */}
        <Card
          className={
            billing.plan !== "pro"
              ? "from-primary/5 border-primary/20 bg-gradient-to-br to-transparent"
              : undefined
          }
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary size-4" />
                  Boopy Pro
                </CardTitle>
              </div>
              {billing.plan !== "pro" && (
                <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  7-day free trial
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Non-Pro: billing toggle + price */}
            {billing.plan !== "pro" && (
              <>
                <IntervalToggle
                  value={interval}
                  onChange={setInterval}
                  disabled={loadingCheckout}
                />
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-bold">
                    ${interval === "annual" ? ANNUAL_PRICE : MONTHLY_PRICE}
                  </span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                  <span className="text-muted-foreground text-sm line-through">
                    ${ORIGINAL_PRICE}
                  </span>
                  {interval === "annual" && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Save ${(MONTHLY_PRICE - ANNUAL_PRICE) * 12}/yr
                    </span>
                  )}
                </div>
                {interval === "annual" && (
                  <p className="text-muted-foreground text-xs">
                    Billed annually at ${ANNUAL_PRICE * 12}/year
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  Card required at sign-up · Cancel anytime · 15-day money-back guarantee
                </p>
                <div className="space-y-2">
                  <Label htmlFor="promotion-code">Promo code (optional)</Label>
                  <Input
                    id="promotion-code"
                    autoComplete="off"
                    placeholder="e.g. LAUNCH2026"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    disabled={loadingCheckout}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={loadingCheckout}
                  onClick={() => void startCheckout()}
                >
                  {loadingCheckout && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                  {loadingCheckout ? "Opening checkout…" : "Start free trial"}
                </Button>
              </>
            )}

            {/* Monthly Pro: show switch-to-annual option */}
            {isMonthlyPro && billingInfo?.annualAvailable && !switchSuccess && (
              <div className="border-primary/30 bg-primary/3 space-y-3 rounded-xl border border-dashed p-4">
                <div>
                  <p className="text-sm font-semibold">Switch to Annual — save $48/year</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    You&apos;ll only pay for the months remaining in your current year. We&apos;ll
                    credit the unused portion of this month.
                  </p>
                </div>

                {!switchPreview ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingPreview}
                    onClick={() => void previewSwitch()}
                  >
                    {loadingPreview && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                    {loadingPreview ? "Calculating…" : "Preview switch"}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border bg-white/60 px-3 py-2.5 text-sm">
                      <p className="text-muted-foreground mb-1 text-xs">
                        Next charge (after proration credit)
                      </p>
                      <p className="font-heading text-primary text-xl font-bold">
                        {formatCents(switchPreview.amountDue, switchPreview.currency)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Then ${ANNUAL_PRICE * 12}/year every year after that.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={switching} onClick={() => void confirmSwitch()}>
                        {switching && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                        {switching ? "Switching…" : "Confirm switch to Annual"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={switching}
                        onClick={() => setSwitchPreview(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Annual Pro: confirmation */}
            {isAnnualPro && (
              <p className="text-muted-foreground text-sm">
                You&apos;re on Annual Pro — the best value. Use &ldquo;Manage / Cancel&rdquo; on the
                left to update payment details.
              </p>
            )}

            {/* Feature list collapsible */}
            <div className="border-t pt-3">
              <button
                type="button"
                onClick={() => setFeaturesOpen((o) => !o)}
                className="hover:text-foreground text-muted-foreground flex w-full items-center justify-between text-sm font-medium transition-colors"
              >
                {billing.plan === "pro" ? "Your included features" : "What's included in Pro"}
                {featuresOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>

              {featuresOpen && (
                <div className="mt-3 grid gap-x-6 gap-y-0 sm:grid-cols-2">
                  {billing.plan !== "pro" && (
                    <div className="mb-3 sm:col-span-2">
                      <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                        Free
                      </p>
                      {FREE_FEATURES.map((f) => (
                        <FeatureRow key={f} label={f} included={false} />
                      ))}
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-primary mb-1 text-xs font-semibold tracking-wide uppercase">
                      Pro
                    </p>
                    {PRO_FEATURES.map((f) => (
                      <FeatureRow key={f} label={f} included={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {loadingBillingInfo && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Loader2 className="size-3 animate-spin" /> Loading billing details…
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
