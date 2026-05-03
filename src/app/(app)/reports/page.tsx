"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BreakdownCard } from "@/components/boopy/reports/breakdown-card";
import { GroupAnalytics } from "@/components/boopy/reports/group-analytics";
import { PeriodFilter } from "@/components/boopy/reports/period-filter";
import { TrendCard } from "@/components/boopy/reports/trend-card";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { buildReportRows, filterReportRows } from "@/lib/reports/export";
import { fetchReportSubscriptions } from "@/lib/reports/queries";
import { calculateTotalsByCurrency, formatCurrency } from "@/lib/reports/spend";
import {
  buildCategoryBreakdown,
  buildGroupBreakdown,
  buildMonthlyTrend,
  splitSubscriptionsByCurrency,
  buildVendorBreakdown,
  type ReportSubscription,
} from "@/lib/reports/transformers";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default function ReportsPage() {
  const router = useRouter();
  const { state } = usePrimaryWorkspace();
  const searchParams = useSearchParams();
  const [months, setMonths] = useState(6);
  const [subs, setSubs] = useState<ReportSubscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(searchParams.get("q")?.trim() ?? "");
  const [groupSelection, setGroupSelection] = useState(searchParams.get("groupId")?.trim() ?? "");
  const [currencySelection, setCurrencySelection] = useState(
    searchParams.get("currency")?.trim() ?? ""
  );
  const [exporting, setExporting] = useState<null | "csv" | "pdf" | "xlsx" | "gsheet">(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string | null>(null);
  const groupIdFilter = searchParams.get("groupId")?.trim() ?? "";
  const keywordFilter = searchParams.get("q")?.trim() ?? "";
  const currencyFilter = searchParams.get("currency")?.trim() ?? "";

  useEffect(() => {
    setSearchText(keywordFilter);
    setGroupSelection(groupIdFilter);
    setCurrencySelection(currencyFilter);
  }, [currencyFilter, groupIdFilter, keywordFilter]);

  useEffect(() => {
    async function load() {
      if (state.status !== "ready") return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const { data, error: loadError } = await fetchReportSubscriptions(
        supabase,
        state.workspaceId
      );
      if (loadError) {
        setError(loadError);
        setSubs([]);
        return;
      }
      setError(null);
      setSubs(data);
    }
    queueMicrotask(() => {
      void load();
    });
  }, [state]);

  const reportRows = useMemo(() => buildReportRows(subs), [subs]);
  const filteredRows = useMemo(
    () =>
      filterReportRows(reportRows, {
        groupId: groupIdFilter,
        keyword: keywordFilter,
        currency: currencyFilter,
      }),
    [currencyFilter, groupIdFilter, keywordFilter, reportRows]
  );
  const filteredSubs = useMemo(() => {
    const rowIds = new Set(filteredRows.map((row) => row.subscriptionId));
    return subs.filter((subscription) => rowIds.has(subscription.id));
  }, [filteredRows, subs]);
  const currencyOptions = useMemo(
    () =>
      [
        ...new Set(
          filteredSubs.map((subscription) => (subscription.currency ?? "USD").toUpperCase())
        ),
      ].sort(),
    [filteredSubs]
  );
  const currencySections = useMemo(
    () => splitSubscriptionsByCurrency(filteredSubs),
    [filteredSubs]
  );
  const analyticsSections = useMemo(() => {
    const selectedSections = currencyFilter
      ? currencySections.filter((section) => section.currency === currencyFilter.toUpperCase())
      : currencySections;
    return selectedSections.map((section) => ({
      currency: section.currency,
      subscriptions: section.subscriptions,
      trendRows: buildMonthlyTrend(section.subscriptions, months),
      categoryRows: buildCategoryBreakdown(section.subscriptions),
      vendorRows: buildVendorBreakdown(section.subscriptions),
      groupRows: buildGroupBreakdown(section.subscriptions),
    }));
  }, [currencySections, currencyFilter, months]);
  const analyticsSubscriptions = useMemo(
    () => analyticsSections.flatMap((section) => section.subscriptions),
    [analyticsSections]
  );

  const focusedGroupName = useMemo(() => {
    if (!groupIdFilter) return null;
    const match = subs.find((subscription) => first(subscription.groups)?.id === groupIdFilter);
    return first(match?.groups)?.name ?? null;
  }, [groupIdFilter, subs]);

  const filteredTotalsByCurrency = useMemo(
    () =>
      calculateTotalsByCurrency(
        analyticsSubscriptions.map((subscription) => ({
          amount: subscription.amount,
          cadence: subscription.cadence,
          status: subscription.status,
          currency: subscription.currency,
          termEndDateYmd: subscription.end_date,
        }))
      ),
    [analyticsSubscriptions]
  );
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const subscription of subs) {
      const group = first(subscription.groups);
      if (group?.id && group.name) map.set(group.id, group.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subs]);

  async function downloadReport(format: "csv" | "pdf" | "xlsx" | "gsheet") {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("You are not signed in.");
      return;
    }

    setExporting(format);
    setError(null);
    setGoogleSheetUrl(null);
    try {
      const params = new URLSearchParams({
        workspaceId: state.workspaceId,
        format,
      });
      if (groupIdFilter) params.set("groupId", groupIdFilter);
      if (keywordFilter) params.set("q", keywordFilter);
      if (currencyFilter) params.set("currency", currencyFilter);

      const response = await fetch(`/api/reports/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Failed to export report.");
      }

      if (format === "gsheet") {
        const payload = (await response.json()) as { url?: string };
        if (!payload.url) throw new Error("Google Sheets link missing.");
        setGoogleSheetUrl(payload.url);
        return;
      }

      const blob = await response.blob();
      const extension = format === "xlsx" ? "xlsx" : format;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `boopy-report.${extension}`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Export failed.");
    } finally {
      setExporting(null);
    }
  }

  function applySearchFilters() {
    const params = new URLSearchParams();
    if (groupSelection) params.set("groupId", groupSelection);
    if (searchText.trim()) params.set("q", searchText.trim());
    if (currencySelection) params.set("currency", currencySelection);
    const query = params.toString();
    router.replace(`/reports${query ? `?${query}` : ""}`);
  }

  if (state.status === "not_configured") {
    return <MissingSupabaseConfig />;
  }
  if (state.status === "schema_not_ready") {
    return <SchemaNotReady details={state.details} />;
  }
  if (state.status !== "ready") {
    return <div className="text-muted-foreground p-8 text-sm">Loading reports…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm">
            {focusedGroupName
              ? `Trend and breakdown analytics for ${focusedGroupName}.`
              : "Trend and breakdown analytics for your subscriptions."}
          </p>
        </div>
        <PeriodFilter value={months} onChange={setMonths} />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]">
        <Input
          placeholder="Search by group or keyword..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <select
          value={groupSelection}
          onChange={(event) => setGroupSelection(event.target.value)}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="">All groups</option>
          {groupOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <select
          value={currencySelection}
          onChange={(event) => setCurrencySelection(event.target.value)}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="">All currencies</option>
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={applySearchFilters}>
          Apply filters
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={exporting !== null}
          onClick={() => void downloadReport("csv")}
        >
          {exporting === "csv" ? "Exporting..." : "Export CSV"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={exporting !== null}
          onClick={() => void downloadReport("pdf")}
        >
          {exporting === "pdf" ? "Exporting..." : "Export PDF"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={exporting !== null}
          onClick={() => void downloadReport("xlsx")}
        >
          {exporting === "xlsx" ? "Exporting..." : "Export Excel"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={exporting !== null}
          onClick={() => void downloadReport("gsheet")}
        >
          {exporting === "gsheet" ? "Exporting..." : "Export to Google Sheets"}
        </Button>
      </div>

      {groupIdFilter || keywordFilter || currencyFilter ? (
        <Alert>
          <AlertTitle>Filtered report view</AlertTitle>
          <AlertDescription>
            Showing data for <strong>{focusedGroupName ?? "the selected group"}</strong>
            {keywordFilter ? ` matching "${keywordFilter}"` : ""}.{" "}
            {currencyFilter ? `Currency: ${currencyFilter}. ` : ""}
            <Link
              href="/reports"
              className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto px-1")}
            >
              Clear filter
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      {analyticsSections.length > 1 ? (
        <Alert>
          <AlertTitle>Per-currency analytics mode</AlertTitle>
          <AlertDescription>
            Mixed currencies are shown in separate analytics sections so values are never merged
            across currencies.
          </AlertDescription>
        </Alert>
      ) : null}

      {googleSheetUrl ? (
        <Alert>
          <AlertTitle>Google Sheet ready</AlertTitle>
          <AlertDescription>
            Report exported successfully.{" "}
            <Link href={googleSheetUrl} target="_blank" className="underline">
              Open linked Google Sheet
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load reports</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Alert>
        <AlertTitle>Monthly totals by currency</AlertTitle>
        <AlertDescription>
          {filteredTotalsByCurrency.length === 0
            ? "No active subscriptions for the current filters."
            : filteredTotalsByCurrency
                .map(
                  (bucket) =>
                    `${bucket.currency} ${formatCurrency(bucket.monthly, bucket.currency)}`
                )
                .join(" • ")}
        </AlertDescription>
      </Alert>

      {analyticsSections.length === 0 ? (
        <Alert>
          <AlertTitle>No report data</AlertTitle>
          <AlertDescription>No subscriptions matched your current filters.</AlertDescription>
        </Alert>
      ) : null}

      {analyticsSections.map((section) => (
        <div key={`analytics-${section.currency}`} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {section.currency} analytics
            </h2>
            <p className="text-muted-foreground text-sm">
              {section.subscriptions.length} subscription
              {section.subscriptions.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TrendCard rows={section.trendRows} currency={section.currency} />
            <GroupAnalytics rows={section.groupRows} currency={section.currency} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="By category"
              description="Category-level monthly spend allocation."
              rows={section.categoryRows}
              currency={section.currency}
            />
            <BreakdownCard
              title="By vendor"
              description="Vendor-level monthly spend allocation."
              rows={section.vendorRows}
              currency={section.currency}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
