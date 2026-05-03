/** Billing cadence for recurrence rules (matches DB enum). */
export type SubscriptionCadence = "monthly" | "yearly" | "quarterly" | "custom";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function utcDaysInMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

export function parseRenewalYmd(
  renewalDateYmd: string
): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(renewalDateYmd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

export function formatUtcDayKey(y: number, monthIndex0: number, day: number): string {
  return `${y}-${pad2(monthIndex0 + 1)}-${pad2(day)}`;
}

/** Months between (ay, am) and (y, m), each month is one step. */
export function monthsSinceAnchor(ay: number, am: number, y: number, m: number): number {
  return (y - ay) * 12 + (m - am);
}

/**
 * Scheduled billing day in UTC calendar month (y, m), clamped when the month is shorter
 * than the anchor day (e.g. Jan 31 → Feb 28/29).
 */
export function scheduledDayInMonth(anchorD: number, year: number, monthIndex0: number): number {
  const dim = utcDaysInMonth(year, monthIndex0);
  return Math.min(anchorD, dim);
}

function cadencePeriodMonths(cadence: SubscriptionCadence): number | null {
  if (cadence === "monthly") return 1;
  if (cadence === "quarterly") return 3;
  if (cadence === "yearly") return 12;
  return null;
}

function monthMatchesCadence(monthsSince: number, cadence: SubscriptionCadence): boolean {
  const period = cadencePeriodMonths(cadence);
  if (period === null) return false;
  return monthsSince % period === 0;
}

/** Optional inclusive YYYY-MM-DD clamps on generated billing dates. */
export type RecurrenceBounds = {
  startDateYmd?: string | null;
  endDateYmd?: string | null;
};

export function recurrenceBoundsFromNullable(
  startDateYmd: string | null | undefined,
  endDateYmd: string | null | undefined
): RecurrenceBounds | null {
  if (!startDateYmd?.trim() && !endDateYmd?.trim()) return null;
  return {
    startDateYmd: startDateYmd?.trim() || undefined,
    endDateYmd: endDateYmd?.trim() || undefined,
  };
}

function compareDayKeys(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function clampKeysToBounds(keys: string[], bounds?: RecurrenceBounds | null): string[] {
  if (!bounds?.startDateYmd && !bounds?.endDateYmd) return keys;
  const start = bounds.startDateYmd?.trim();
  const end = bounds.endDateYmd?.trim();
  return keys.filter((k) => {
    if (start && compareDayKeys(k, start) < 0) return false;
    if (end && compareDayKeys(k, end) > 0) return false;
    return true;
  });
}

/**
 * All YYYY-MM-DD occurrence keys in [rangeStart, rangeEnd] (inclusive, UTC date boundaries).
 */
export function recurrenceOccurrenceDayKeysInUtcRange(
  renewalDateYmd: string,
  cadence: SubscriptionCadence,
  rangeStartInclusiveUtc: Date,
  rangeEndInclusiveUtc: Date,
  bounds?: RecurrenceBounds | null
): string[] {
  const anchor = parseRenewalYmd(renewalDateYmd);
  if (!anchor) return [];

  if (cadence === "custom") {
    const key = formatUtcDayKey(anchor.y, anchor.m, anchor.d);
    const occ = new Date(`${key}T00:00:00.000Z`);
    if (occ >= rangeStartInclusiveUtc && occ <= rangeEndInclusiveUtc) {
      return clampKeysToBounds([key], bounds);
    }
    return [];
  }

  const out: string[] = [];
  let y = rangeStartInclusiveUtc.getUTCFullYear();
  let m = rangeStartInclusiveUtc.getUTCMonth();
  const endY = rangeEndInclusiveUtc.getUTCFullYear();
  const endM = rangeEndInclusiveUtc.getUTCMonth();

  while (y < endY || (y === endY && m <= endM)) {
    const monthsSince = monthsSinceAnchor(anchor.y, anchor.m, y, m);
    const day = scheduledDayInMonth(anchor.d, y, m);
    const occ = new Date(Date.UTC(y, m, day));
    if (
      occ >= rangeStartInclusiveUtc &&
      occ <= rangeEndInclusiveUtc &&
      monthsSince >= 0 &&
      monthMatchesCadence(monthsSince, cadence)
    ) {
      out.push(formatUtcDayKey(y, m, day));
    }
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }

  return clampKeysToBounds(out, bounds);
}

/**
 * True if any billing occurrence falls on one of the given day keys (YYYY-MM-DD).
 */
export function recurrenceTouchesDaySet(
  renewalDateYmd: string,
  cadence: SubscriptionCadence,
  dayKeys: Set<string>,
  bounds?: RecurrenceBounds | null
): boolean {
  if (dayKeys.size === 0) return false;
  for (const key of dayKeys) {
    const d = new Date(`${key}T00:00:00.000Z`);
    if (!Number.isFinite(d.getTime())) continue;
    const keys = recurrenceOccurrenceDayKeysInUtcRange(renewalDateYmd, cadence, d, d, bounds);
    if (keys.length > 0) return true;
  }
  return false;
}

/**
 * True if any occurrence falls in the given YYYY-MM month (UTC).
 */
export function recurrenceTouchesMonth(
  renewalDateYmd: string,
  cadence: SubscriptionCadence,
  monthYyyymm: string,
  bounds?: RecurrenceBounds | null
): boolean {
  const trimmed = monthYyyymm.trim();
  if (!/^\d{4}-\d{2}$/.test(trimmed)) return false;
  const start = new Date(`${trimmed}-01T00:00:00.000Z`);
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth();
  const end = new Date(Date.UTC(y, m + 1, 0));
  const keys = recurrenceOccurrenceDayKeysInUtcRange(renewalDateYmd, cadence, start, end, bounds);
  return keys.length > 0;
}

/** Earliest occurrence on or after `onOrAfterUtc` (inclusive), or null if none in a bounded search. */
export function nextOccurrenceDayKeyOnOrAfter(
  renewalDateYmd: string,
  cadence: SubscriptionCadence,
  onOrAfterUtc: Date,
  bounds?: RecurrenceBounds | null
): string | null {
  const endYmd = bounds?.endDateYmd?.trim();
  if (endYmd) {
    const endClamp = new Date(`${endYmd}T23:59:59.999Z`);
    if (onOrAfterUtc > endClamp) return null;
  }
  const end = new Date(onOrAfterUtc);
  end.setUTCFullYear(end.getUTCFullYear() + 2);
  if (endYmd) {
    const endCap = new Date(`${endYmd}T23:59:59.999Z`);
    if (end > endCap) {
      end.setTime(endCap.getTime());
    }
  }
  const keys = recurrenceOccurrenceDayKeysInUtcRange(
    renewalDateYmd,
    cadence,
    onOrAfterUtc,
    end,
    bounds
  );
  return keys[0] ?? null;
}
