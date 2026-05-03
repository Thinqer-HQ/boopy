"use client";

import { ChevronLeft, ChevronRight, Link as LinkIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { formatCurrency } from "@/lib/reports/spend";
import {
  recurrenceOccurrenceDayKeysInUtcRange,
  type SubscriptionCadence,
} from "@/lib/subscriptions/recurrence";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number | string;
  currency: string;
  cadence: SubscriptionCadence;
  renewal_date: string;
  status: "active" | "paused" | "cancelled";
  groups: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};

type IntegrationRow = {
  provider: string;
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
  const [selectedSyncDays, setSelectedSyncDays] = useState<Set<string>>(new Set());
  const [syncScope, setSyncScope] = useState<"all" | "month" | "days">("month");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const selectedMonth = monthKey(monthCursor);
  const selectedYear = monthCursor.getUTCFullYear();
  const groupIdFromQuery = searchParams.get("groupId")?.trim() ?? "";
  const groupFilter = manualGroupFilter ?? (groupIdFromQuery || "all");

  useEffect(() => {
    async function load() {
      if (state.status !== "ready") return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const { data, error: loadError } = await supabase
        .from("subscriptions")
        .select(
          "id, vendor_name, amount, currency, cadence, renewal_date, status, groups!inner(id, name, workspace_id)"
        )
        .eq("groups.workspace_id", state.workspaceId)
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
        .eq("workspace_id", state.workspaceId)
        .eq("provider", "google")
        .limit(1);
      setGoogleConnected(Boolean((integrations as IntegrationRow[] | null)?.length));
    }
    queueMicrotask(() => {
      void load();
    });
  }, [state]);

  const groups = useMemo(() => {
    const map = new Map<string, string>();
    for (const subscription of subs) {
      const group = first(subscription.groups);
      if (group?.id && group.name) {
        map.set(group.id, group.name);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subs]);

  const visibleSubscriptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return subs.filter((subscription) => {
      const group = first(subscription.groups);
      if (groupFilter !== "all" && group?.id !== groupFilter) return false;
      if (!normalizedSearch) return true;
      const haystack = `${subscription.vendor_name} ${group?.name ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
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

  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(gridStart);
      date.setUTCDate(gridStart.getUTCDate() + index);
      return date;
    });
  }, [gridStart]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SubscriptionRow[]>();
    if (calendarDays.length === 0) return map;
    const rangeStart = calendarDays[0]!;
    const rangeEnd = calendarDays[calendarDays.length - 1]!;
    for (const subscription of visibleSubscriptions) {
      const dayKeys = recurrenceOccurrenceDayKeysInUtcRange(
        subscription.renewal_date,
        subscription.cadence,
        rangeStart,
        rangeEnd
      );
      for (const key of dayKeys) {
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(subscription);
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
    for (const event of selectedDayEvents) {
      const currency = (event.currency ?? "USD").toUpperCase();
      const amount = Number(event.amount ?? 0);
      if (!Number.isFinite(amount)) continue;
      map.set(currency, (map.get(currency) ?? 0) + amount);
    }
    return Array.from(map.entries())
      .map(([currency, total]) => ({ currency, total }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }, [selectedDayEvents]);

  const yearOptions = useMemo(() => {
    const baseYear = new Date().getUTCFullYear();
    return Array.from({ length: 15 }).map((_, index) => baseYear - 7 + index);
  }, []);

  function shiftMonth(delta: number) {
    setMonthCursor(
      (current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + delta, 1))
    );
  }

  function updateYear(year: number) {
    setMonthCursor((current) => new Date(Date.UTC(year, current.getUTCMonth(), 1)));
  }

  function toggleSyncDay(day: string) {
    setSelectedSyncDays((current) => {
      const next = new Set(current);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }

  async function connectGoogleCalendar() {
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
    const response = await fetch(
      `/api/integrations/google/start?workspaceId=${state.workspaceId}&redirectTo=${encodeURIComponent("/calendar")}`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }
    );
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok || !payload.url) {
      setError(payload.error ?? "Could not start Google Calendar connection.");
      return;
    }
    window.location.href = payload.url;
  }

  async function syncCalendar() {
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
    if (syncScope === "days" && selectedSyncDays.size === 0) {
      setError("Select at least one day when syncing selected days.");
      return;
    }
    setError(null);
    setSyncing(true);
    setSyncMessage(null);
    const response = await fetch("/api/integrations/google/resync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        workspaceId: state.workspaceId,
        scope: syncScope,
        month: selectedMonth,
        dates: Array.from(selectedSyncDays),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setSyncing(false);
    if (!response.ok) {
      setError(payload.error ?? "Calendar sync failed.");
      return;
    }
    setSyncMessage("Google Calendar sync completed.");
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status !== "ready") {
    return <div className="text-muted-foreground p-8 text-sm">Loading calendar…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Renewal calendar</h1>
        <p className="text-muted-foreground text-sm">
          Filter and search renewals across all groups in a calendar layout.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Focus on the month, group, or vendor you care about.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(event) => {
              if (!event.target.value) return;
              const [yearValue, monthValue] = event.target.value.split("-").map(Number);
              if (!yearValue || !monthValue) return;
              setMonthCursor(new Date(Date.UTC(yearValue, monthValue - 1, 1)));
            }}
          />
          <select
            value={groupFilter}
            onChange={(event) => setManualGroupFilter(event.target.value)}
            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          >
            <option value="all">All groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendor..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar sync</CardTitle>
          <CardDescription>
            Connect and sync renewals from this calendar view. Choose all renewals, just this month,
            or selected days.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={googleConnected ? "secondary" : "outline"}>
              {googleConnected ? "Google connected" : "Google not connected"}
            </Badge>
            {!googleConnected ? (
              <Button variant="outline" onClick={() => void connectGoogleCalendar()}>
                <LinkIcon className="size-4" />
                Connect Google Calendar
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
            <select
              value={syncScope}
              onChange={(event) => setSyncScope(event.target.value as "all" | "month" | "days")}
              className="border-input bg-background h-10 rounded-md border px-3 text-sm"
            >
              <option value="all">Sync all renewals</option>
              <option value="month">Sync current month ({selectedMonth})</option>
              <option value="days">Sync selected days</option>
            </select>
            <div className="text-muted-foreground text-sm">
              {syncScope === "days"
                ? `${selectedSyncDays.size} day${selectedSyncDays.size === 1 ? "" : "s"} selected`
                : syncScope === "month"
                  ? `Only renewals in ${monthLabel(monthCursor)} will sync`
                  : "All renewal records in this workspace will sync"}
            </div>
            <Button disabled={!googleConnected || syncing} onClick={() => void syncCalendar()}>
              {syncing ? "Syncing..." : "Sync now"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSyncScope("days");
                const allMonthDays = calendarDays
                  .filter((date) => monthKey(date) === selectedMonth)
                  .map((date) => formatDay(date));
                setSelectedSyncDays(new Set(allMonthDays));
              }}
            >
              Select entire month
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedSyncDays(new Set())}>
              Clear selected days
            </Button>
          </div>
          {syncMessage ? <p className="text-sm text-emerald-600">{syncMessage}</p> : null}
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load calendar data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </Button>
              <select
                value={String(selectedYear)}
                onChange={(event) => updateYear(Number(event.target.value))}
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                aria-label="Choose calendar year"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <CardDescription>
            <span className="mr-2">{monthLabel(monthCursor)}</span>
            <span className="float-right text-right">Year {selectedYear}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 hidden flex-wrap items-center gap-2 text-xs sm:flex">
            <Badge variant="outline">Click any day box to open details</Badge>
            <Badge variant="outline">Use checkbox to include days in sync</Badge>
            <Badge variant="outline">Today highlighted</Badge>
          </div>
          <p className="text-muted-foreground mb-3 text-xs sm:hidden">
            Tap a day for details. Pinch or scroll the calendar horizontally if needed.
          </p>
          <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="min-w-[min(100%,520px)] sm:min-w-0">
              <div className="grid grid-cols-7 gap-1 text-[10px] font-medium sm:gap-2 sm:text-xs">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
                  const short = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][i] ?? day.slice(0, 2);
                  return (
                    <div
                      key={day}
                      className="text-muted-foreground px-0.5 py-1 text-center sm:px-2"
                    >
                      <span className="sm:hidden">{short}</span>
                      <span className="hidden sm:inline">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((date) => {
                  const key = formatDay(date);
                  const events = eventsByDay.get(key) ?? [];
                  const isCurrentMonth = monthKey(date) === selectedMonth;
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDay;
                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedDay(key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedDay(key);
                        }
                      }}
                      className={`min-h-24 rounded-lg border p-1.5 text-left transition-colors sm:min-h-28 sm:p-2 ${
                        isCurrentMonth ? "bg-background hover:bg-muted/40" : "bg-muted/30"
                      } ${isToday ? "ring-primary/40 ring-2" : ""} ${isSelected ? "border-primary bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`rounded px-1.5 py-0.5 text-xs font-semibold ${isCurrentMonth ? "" : "text-muted-foreground"} ${
                            isSelected ? "bg-primary text-primary-foreground" : ""
                          }`}
                        >
                          {date.getUTCDate()}
                        </p>
                        {isCurrentMonth ? (
                          <button
                            type="button"
                            aria-label={`Select ${key} for sync`}
                            className={`h-4 w-4 rounded-sm border transition-colors ${
                              selectedSyncDays.has(key)
                                ? "border-black bg-black"
                                : "border-zinc-400 bg-transparent"
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSyncScope("days");
                              toggleSyncDay(key);
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="mt-1 space-y-1">
                        {events.slice(0, 3).map((event) => {
                          const group = first(event.groups);
                          return (
                            <div
                              key={event.id}
                              className="rounded border-l-4 border-indigo-400 bg-indigo-50/70 p-1 dark:bg-indigo-950/30"
                            >
                              <p className="truncate text-xs font-medium">{event.vendor_name}</p>
                              <div className="flex items-center justify-between gap-1">
                                <Badge variant="outline" className="h-4 px-1 text-[10px]">
                                  {group?.name ?? "Unknown"}
                                </Badge>
                                <span className="text-[10px]">
                                  {formatCurrency(Number(event.amount ?? 0), event.currency)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {events.length > 3 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDay(key)}
                            className="text-muted-foreground text-[10px] underline-offset-2 hover:underline"
                          >
                            +{events.length - 3} more
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              {selectedDayEvents.length} subscription{selectedDayEvents.length === 1 ? "" : "s"} on
              this day.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {selectedDayTotals.length === 0 ? (
              <Badge variant="outline">No spend records</Badge>
            ) : (
              selectedDayTotals.map((bucket) => (
                <Badge key={`day-total-${bucket.currency}`} variant="secondary">
                  {bucket.currency} {formatCurrency(bucket.total, bucket.currency)}
                </Badge>
              ))
            )}
          </div>
          <div className="space-y-2">
            {selectedDayEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No renewals on this date.</p>
            ) : (
              selectedDayEvents.map((event) => {
                const group = first(event.groups);
                return (
                  <div key={`dialog-${event.id}`} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{event.vendor_name}</p>
                        <p className="text-muted-foreground text-xs">
                          {group?.name ?? "Unknown group"} • {event.status}
                        </p>
                      </div>
                      <Badge variant="outline">{event.cadence}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {formatCurrency(Number(event.amount ?? 0), event.currency)}
                    </p>
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
