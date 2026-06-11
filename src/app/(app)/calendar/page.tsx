"use client";

import { ChevronLeft, ChevronRight, Link as LinkIcon, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActiveWorkspaceId } from "@/contexts/active-workspace-context";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { formatCurrency } from "@/lib/reports/spend";
import {
  recurrenceBoundsFromNullable,
  recurrenceOccurrenceDayKeysInUtcRange,
  type SubscriptionCadence,
} from "@/lib/subscriptions/recurrence";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

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

type IntegrationRow = { provider: string };

type MonthChargeLine = {
  subscriptionId: string;
  vendor: string;
  currency: string;
  amountEach: number;
  occurrences: number;
  lineTotal: number;
  cadence: SubscriptionCadence;
  status: SubscriptionRow["status"];
  groupId: string;
  groupName: string;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatDay(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function toUtcDateFromKey(dayKey: string) {
  return new Date(`${dayKey}T00:00:00.000Z`);
}

export default function CalendarPage() {
  const { state } = usePrimaryWorkspace();
  const shellWorkspaceId = useActiveWorkspaceId();
  const searchParams = useSearchParams();
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [manualGroupFilter, setManualGroupFilter] = useState<string | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [focusedDay, setFocusedDay] = useState<string | null>(null);
  const [monthSummaryOpen, setMonthSummaryOpen] = useState(false);
  const [selectedSyncDays, setSelectedSyncDays] = useState<Set<string>>(new Set());
  const [syncScope, setSyncScope] = useState<"all" | "month" | "days">("month");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const selectedMonth = monthKey(monthCursor);
  const selectedYear = monthCursor.getUTCFullYear();
  const groupIdFromQuery = searchParams.get("groupId")?.trim() ?? "";
  const groupFilter = manualGroupFilter ?? (groupIdFromQuery || "all");
  const dateParam = searchParams.get("date")?.trim() ?? "";

  const resolvedWorkspaceId =
    shellWorkspaceId ?? (state.status === "ready" ? state.workspaceId : null);

  useEffect(() => {
    async function load() {
      if (!resolvedWorkspaceId) return;
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setError("Could not open the database client in this browser tab.");
        setSubs([]);
        return;
      }
      const { data, error: loadError } = await supabase
        .from("subscriptions")
        .select(
          "id, vendor_name, amount, currency, cadence, renewal_date, start_date, end_date, status, groups!inner(id, name, workspace_id)"
        )
        .eq("groups.workspace_id", resolvedWorkspaceId)
        .order("renewal_date", { ascending: true });
      if (loadError) {
        setError(loadError.message);
        setSubs([]);
        return;
      }
      setError(null);
      setSubs((data ?? []) as SubscriptionRow[]);

      const { data: integrations } = await supabase
        .from("calendar_integrations")
        .select("provider")
        .eq("workspace_id", resolvedWorkspaceId)
        .eq("provider", "google")
        .limit(1);
      setGoogleConnected(Boolean((integrations as IntegrationRow[] | null)?.length));
    }
    queueMicrotask(() => {
      void load();
    });
  }, [resolvedWorkspaceId]);

  const groups = useMemo(() => {
    const map = new Map<string, string>();
    for (const subscription of subs) {
      const group = first(subscription.groups);
      if (group?.id && group.name) map.set(group.id, group.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subs]);

  useEffect(() => {
    if (groupFilter === "all") return;
    const known = new Set(groups.map((g) => g.id));
    if (!known.has(groupFilter)) setManualGroupFilter("all");
  }, [groupFilter, groups]);

  // Navigate to date from URL param — highlight the cell but don't open dialog
  useEffect(() => {
    if (!dateParam) return;
    const d = new Date(`${dateParam}T00:00:00.000Z`);
    if (isNaN(d.getTime())) return;
    setMonthCursor(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
    setFocusedDay(dateParam);
  }, [dateParam]);

  const visibleSubscriptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subs.filter((s) => {
      const group = first(s.groups);
      if (groupFilter !== "all" && group?.id !== groupFilter) return false;
      if (!q) return true;
      return `${s.vendor_name} ${group?.name ?? ""}`.toLowerCase().includes(q);
    });
  }, [subs, groupFilter, search]);

  const firstDayOfMonth = useMemo(
    () => new Date(`${selectedMonth}-01T00:00:00.000Z`),
    [selectedMonth]
  );
  const gridStart = useMemo(() => {
    const dayOfWeek = firstDayOfMonth.getUTCDay();
    const start = new Date(firstDayOfMonth);
    start.setUTCDate(firstDayOfMonth.getUTCDate() - dayOfWeek);
    return start;
  }, [firstDayOfMonth]);

  const calendarDays = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => {
        const d = new Date(gridStart);
        d.setUTCDate(gridStart.getUTCDate() + i);
        return d;
      }),
    [gridStart]
  );

  const monthRangeUtc = useMemo(() => {
    const start = new Date(`${selectedMonth}-01T00:00:00.000Z`);
    const y = start.getUTCFullYear();
    const m = start.getUTCMonth();
    return { start, end: new Date(Date.UTC(y, m + 1, 0)) };
  }, [selectedMonth]);

  const monthChargeRollup = useMemo(() => {
    const { start, end } = monthRangeUtc;
    const lines: MonthChargeLine[] = [];
    for (const s of visibleSubscriptions) {
      const bounds = recurrenceBoundsFromNullable(s.start_date, s.end_date);
      const dayKeys = recurrenceOccurrenceDayKeysInUtcRange(
        s.renewal_date,
        s.cadence,
        start,
        end,
        bounds
      );
      if (!dayKeys.length) continue;
      const amountEach = Number(s.amount ?? 0);
      if (!Number.isFinite(amountEach)) continue;
      const currency = (s.currency ?? "USD").toUpperCase();
      const group = first(s.groups);
      lines.push({
        subscriptionId: s.id,
        vendor: s.vendor_name,
        currency,
        amountEach,
        occurrences: dayKeys.length,
        lineTotal: amountEach * dayKeys.length,
        cadence: s.cadence,
        status: s.status,
        groupId: group?.id ?? "unknown",
        groupName: group?.name ?? "Unknown",
      });
    }
    const totalsMap = new Map<string, number>();
    for (const l of lines)
      totalsMap.set(l.currency, (totalsMap.get(l.currency) ?? 0) + l.lineTotal);
    const totalsByCurrency = Array.from(totalsMap.entries())
      .map(([currency, total]) => ({ currency, total }))
      .sort((a, b) => a.currency.localeCompare(b.currency));

    const groupMap = new Map<string, { name: string; lines: MonthChargeLine[] }>();
    for (const l of lines) {
      const b = groupMap.get(l.groupId);
      if (b) b.lines.push(l);
      else groupMap.set(l.groupId, { name: l.groupName, lines: [l] });
    }
    const byGroup = Array.from(groupMap.entries())
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .map(([groupId, bucket]) => {
        const subMap = new Map<string, number>();
        for (const l of bucket.lines)
          subMap.set(l.currency, (subMap.get(l.currency) ?? 0) + l.lineTotal);
        return {
          groupId,
          name: bucket.name,
          lines: [...bucket.lines].sort((a, b) => a.vendor.localeCompare(b.vendor)),
          subtotalsByCurrency: Array.from(subMap.entries())
            .map(([currency, total]) => ({ currency, total }))
            .sort((a, b) => a.currency.localeCompare(b.currency)),
        };
      });

    return { lines, totalsByCurrency, byGroup };
  }, [visibleSubscriptions, monthRangeUtc]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SubscriptionRow[]>();
    if (!calendarDays.length) return map;
    const rangeStart = calendarDays[0]!;
    const rangeEnd = calendarDays[calendarDays.length - 1]!;
    for (const s of visibleSubscriptions) {
      const bounds = recurrenceBoundsFromNullable(s.start_date, s.end_date);
      const dayKeys = recurrenceOccurrenceDayKeysInUtcRange(
        s.renewal_date,
        s.cadence,
        rangeStart,
        rangeEnd,
        bounds
      );
      for (const key of dayKeys) {
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
      }
    }
    return map;
  }, [visibleSubscriptions, calendarDays]);

  const selectedDayEvents = useMemo(
    () => (selectedDay ? (eventsByDay.get(selectedDay) ?? []) : []),
    [eventsByDay, selectedDay]
  );
  const todayKey = formatDay(new Date());
  const selectedDayTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of selectedDayEvents) {
      const cur = (e.currency ?? "USD").toUpperCase();
      const amt = Number(e.amount ?? 0);
      if (!Number.isFinite(amt)) continue;
      map.set(cur, (map.get(cur) ?? 0) + amt);
    }
    return Array.from(map.entries())
      .map(([currency, total]) => ({ currency, total }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }, [selectedDayEvents]);

  const yearOptions = useMemo(() => {
    const base = new Date().getUTCFullYear();
    return Array.from({ length: 15 }).map((_, i) => base - 7 + i);
  }, []);

  function shiftMonth(delta: number) {
    setMonthCursor((c) => new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + delta, 1)));
  }

  function toggleSyncDay(day: string) {
    setSelectedSyncDays((c) => {
      const next = new Set(c);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }

  async function connectGoogleCalendar() {
    if (!resolvedWorkspaceId) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("You are not signed in.");
      return;
    }
    const res = await fetch(
      `/api/integrations/google/start?workspaceId=${resolvedWorkspaceId}&redirectTo=${encodeURIComponent("/calendar")}`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !payload.url) {
      setError(payload.error ?? "Could not start Google Calendar connection.");
      return;
    }
    window.location.href = payload.url;
  }

  async function syncCalendar() {
    if (!resolvedWorkspaceId) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("You are not signed in.");
      return;
    }
    if (syncScope === "days" && selectedSyncDays.size === 0) {
      setError("Select at least one day when syncing selected days.");
      return;
    }
    setError(null);
    setSyncing(true);
    setSyncMessage(null);
    const res = await fetch("/api/integrations/google/resync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        workspaceId: resolvedWorkspaceId,
        scope: syncScope,
        month: selectedMonth,
        dates: Array.from(selectedSyncDays),
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setSyncing(false);
    if (!res.ok) {
      setError(payload.error ?? "Calendar sync failed.");
      return;
    }
    setSyncMessage("Synced to Google Calendar.");
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status === "error")
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Workspace unavailable</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      </div>
    );
  if (!resolvedWorkspaceId)
    return (
      <div className="text-muted-foreground p-8 text-sm">
        {state.status === "empty"
          ? "No workspace found. Complete setup from the dashboard first."
          : "Loading calendar…"}
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            {visibleSubscriptions.length} subscription
            {visibleSubscriptions.length !== 1 ? "s" : ""} · {monthLabel(monthCursor)}
          </p>
        </div>
        {/* Google Calendar */}
        <div className="flex flex-wrap items-center gap-2">
          {!googleConnected ? (
            <Button variant="outline" size="sm" onClick={() => void connectGoogleCalendar()}>
              <LinkIcon className="size-3.5" />
              Connect Google Calendar
            </Button>
          ) : (
            <>
              <Badge variant="secondary" className="text-xs">
                Google connected
              </Badge>
              <select
                value={syncScope}
                onChange={(e) => setSyncScope(e.target.value as "all" | "month" | "days")}
                className="border-input bg-background h-8 rounded-md border px-2 text-xs"
              >
                <option value="month">Sync this month</option>
                <option value="all">Sync all renewals</option>
                <option value="days">Sync selected days</option>
              </select>
              <Button
                size="sm"
                className="h-8"
                disabled={syncing}
                onClick={() => void syncCalendar()}
              >
                <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} />
                {syncing ? "Syncing…" : "Sync"}
              </Button>
            </>
          )}
        </div>
      </div>

      {syncMessage && <p className="text-sm text-emerald-600">{syncMessage}</p>}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-2">
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m] = e.target.value.split("-").map(Number);
            if (!y || !m) return;
            setMonthCursor(new Date(Date.UTC(y, m - 1, 1)));
          }}
          className="h-9 w-36"
        />
        <select
          value={groupFilter}
          onChange={(e) => setManualGroupFilter(e.target.value)}
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        >
          <option value="all">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendor…"
          className="h-9 max-w-xs"
        />
        {syncScope === "days" && googleConnected && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                setSyncScope("days");
                setSelectedSyncDays(
                  new Set(
                    calendarDays
                      .filter((d) => monthKey(d) === selectedMonth)
                      .map((d) => formatDay(d))
                  )
                );
              }}
            >
              Select month
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setSelectedSyncDays(new Set())}
            >
              Clear
            </Button>
            <span className="text-muted-foreground flex items-center text-xs">
              {selectedSyncDays.size} day{selectedSyncDays.size !== 1 ? "s" : ""} selected
            </span>
          </div>
        )}
      </div>

      {/* ── Calendar grid ── */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        {/* Month nav */}
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <button
            type="button"
            onClick={() => setMonthSummaryOpen(true)}
            className="flex items-baseline gap-2 text-left underline-offset-4 hover:underline"
          >
            <span className="font-semibold">{monthLabel(monthCursor)}</span>
            {monthChargeRollup.totalsByCurrency.length > 0 ? (
              <span className="text-muted-foreground text-sm tabular-nums">
                {monthChargeRollup.totalsByCurrency
                  .map((b) => `${b.currency} ${formatCurrency(b.total, b.currency)}`)
                  .join(" · ")}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">No renewals</span>
            )}
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <select
              value={String(selectedYear)}
              onChange={(e) =>
                setMonthCursor(
                  (c) => new Date(Date.UTC(Number(e.target.value), c.getUTCMonth(), 1))
                )
              }
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => shiftMonth(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-2 sm:p-3">
          <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1 sm:overflow-visible sm:pb-0">
            <div className="min-w-[34rem]">
              <div className="grid grid-cols-7 text-[10px] font-medium sm:text-xs">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
                  const short = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][i] ?? day.slice(0, 2);
                  return (
                    <div key={day} className="text-muted-foreground px-0.5 py-1 text-center">
                      <span className="sm:hidden">{short}</span>
                      <span className="hidden sm:inline">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date) => {
                  const key = formatDay(date);
                  const events = eventsByDay.get(key) ?? [];
                  const isCurrentMonth = monthKey(date) === selectedMonth;
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDay;
                  const isFocused = !isSelected && key === focusedDay;
                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedDay(key);
                        setFocusedDay(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDay(key);
                          setFocusedDay(null);
                        }
                      }}
                      className={cn(
                        "flex min-h-20 flex-col overflow-visible rounded-lg border p-1 text-left transition-colors sm:p-1.5 lg:overflow-hidden",
                        isCurrentMonth ? "bg-background hover:bg-muted/40" : "bg-muted/20",
                        isToday && "ring-primary/40 ring-2",
                        isSelected && "border-primary bg-primary/5",
                        isFocused && "border-primary/60 bg-primary/5 ring-primary/30 ring-2"
                      )}
                    >
                      <div className="flex items-center justify-between gap-0.5">
                        <p
                          className={cn(
                            "rounded px-1 py-0.5 text-xs font-semibold",
                            !isCurrentMonth && "text-muted-foreground/50",
                            isSelected && "bg-primary text-primary-foreground",
                            isFocused && "bg-primary/20 text-primary"
                          )}
                        >
                          {date.getUTCDate()}
                        </p>
                        {isCurrentMonth && (
                          <button
                            type="button"
                            aria-label={`Select ${key} for sync`}
                            className={cn(
                              "h-3.5 w-3.5 rounded-sm border transition-colors",
                              selectedSyncDays.has(key)
                                ? "border-black bg-black"
                                : "border-zinc-400 bg-transparent"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSyncScope("days");
                              toggleSyncDay(key);
                            }}
                          />
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-1 flex-col gap-0.5 overflow-visible lg:max-h-24 lg:overflow-y-auto lg:overscroll-y-contain">
                        {events.slice(0, 3).map((ev) => {
                          const group = first(ev.groups);
                          return (
                            <div
                              key={ev.id}
                              className="rounded border-l-4 border-indigo-400 bg-indigo-50/70 p-0.5 dark:bg-indigo-950/30"
                            >
                              <p className="line-clamp-1 text-[10px] leading-tight font-medium break-words sm:text-[11px]">
                                {ev.vendor_name}
                              </p>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-muted-foreground truncate text-[9px] sm:text-[10px]">
                                  {group?.name ?? "—"}
                                </span>
                                <span className="shrink-0 text-[9px] sm:text-[10px]">
                                  {formatCurrency(Number(ev.amount ?? 0), ev.currency)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {events.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setSelectedDay(key)}
                            className="text-muted-foreground text-[10px] underline-offset-2 hover:underline"
                          >
                            +{events.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Month summary dialog ── */}
      <Dialog open={monthSummaryOpen} onOpenChange={setMonthSummaryOpen}>
        <DialogContent className="max-h-[min(90dvh,36rem)] gap-4 overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Month spend — {monthLabel(monthCursor)}</DialogTitle>
            <DialogDescription className="text-left">
              Renewal charges scheduled in this month. Yearly/quarterly charges count once at full
              invoice when they land this month.
            </DialogDescription>
          </DialogHeader>
          <div className="border-border space-y-3 border-y py-3">
            <div>
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                Totals
              </p>
              {monthChargeRollup.totalsByCurrency.length === 0 ? (
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  No renewal charges in this month.
                </p>
              ) : (
                <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {monthChargeRollup.totalsByCurrency
                    .map((t) => `${t.currency}  ${formatCurrency(t.total, t.currency)}`)
                    .join("\n")}
                </pre>
              )}
            </div>
            {monthChargeRollup.byGroup.length > 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                  By group
                </p>
                {monthChargeRollup.byGroup.map((group, idx) => (
                  <div
                    key={group.groupId}
                    className={cn(
                      "space-y-1.5",
                      idx > 0 && "border-border/80 border-t border-dotted pt-3"
                    )}
                  >
                    <p className="text-muted-foreground font-mono text-xs font-semibold tracking-wide uppercase">
                      {group.name}
                    </p>
                    <div className="space-y-1.5">
                      {group.lines.map((line) => (
                        <div
                          key={line.subscriptionId}
                          className="font-mono text-[11px] leading-snug"
                        >
                          <p className="text-foreground">{line.vendor}</p>
                          <p className="text-muted-foreground pl-2 tabular-nums">
                            {line.currency} {formatCurrency(line.amountEach, line.currency)}
                            {line.occurrences > 1 ? ` ×${line.occurrences}` : ""} →{" "}
                            {formatCurrency(line.lineTotal, line.currency)} · {line.cadence} ·{" "}
                            {line.status}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="font-mono text-[11px] tabular-nums">
                      {group.subtotalsByCurrency.map((s) => (
                        <div key={s.currency}>
                          Subtotal {s.currency} {formatCurrency(s.total, s.currency)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMonthSummaryOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Day detail dialog ── */}
      <Dialog
        open={Boolean(selectedDay)}
        onOpenChange={(open) => (open ? undefined : setSelectedDay(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Renewals on{" "}
              {selectedDay
                ? toUtcDateFromKey(selectedDay).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                : ""}
            </DialogTitle>
            <DialogDescription>
              {selectedDayEvents.length} subscription
              {selectedDayEvents.length !== 1 ? "s" : ""} renewing.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {selectedDayTotals.length === 0 ? (
              <Badge variant="outline">No spend records</Badge>
            ) : (
              selectedDayTotals.map((b) => (
                <Badge key={b.currency} variant="secondary">
                  {b.currency} {formatCurrency(b.total, b.currency)}
                </Badge>
              ))
            )}
          </div>
          <div className="space-y-1.5">
            {selectedDayEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No renewals on this date.</p>
            ) : (
              selectedDayEvents.map((ev) => {
                const group = first(ev.groups);
                return (
                  <div key={ev.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ev.vendor_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {group?.name ?? "Unknown group"} · {ev.status}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums">
                        {formatCurrency(Number(ev.amount ?? 0), ev.currency)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {ev.cadence}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
