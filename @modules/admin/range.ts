import { DayRange } from "@/models/admin.model";
import { todayKey } from "./format";

/**
 * Date ranges for the admin pages: whole Lagos days ("2026-10-25" to "2026-11-23", both
 * included), the same as the API.
 */

/** Nothing was recorded before this: "All time" starts here. */
export const FIRST_DAY = "2024-05-01";

const DAY_MS = 86_400_000;
const parse = (key: string) => new Date(`${key}T12:00:00Z`);
const key = (d: Date) => d.toISOString().slice(0, 10);

export const addDays = (day: string, n: number) => {
  const d = parse(day);
  d.setUTCDate(d.getUTCDate() + n);
  return key(d);
};

export const daysIn = (r: DayRange) => Math.round((parse(r.to).getTime() - parse(r.from).getTime()) / DAY_MS) + 1;

const startOfMonth = (day: string) => `${day.slice(0, 7)}-01`;
const endOfMonth = (day: string) => {
  const d = parse(startOfMonth(day));
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  return key(d);
};
export const addMonths = (day: string, n: number) => {
  const d = parse(startOfMonth(day));
  d.setUTCMonth(d.getUTCMonth() + n);
  return key(d);
};

export type PresetKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "this_month"
  | "last_month"
  | "12m"
  | "this_year"
  | "all";

export interface Preset {
  key: PresetKey;
  label: string;
  /** Shown beside the label in the menu. */
  hint?: string;
  range: (today: string) => DayRange;
}

export const PRESETS: Preset[] = [
  { key: "today", label: "Today", range: (t) => ({ from: t, to: t }) },
  { key: "yesterday", label: "Yesterday", range: (t) => ({ from: addDays(t, -1), to: addDays(t, -1) }) },
  { key: "7d", label: "Last 7 days", range: (t) => ({ from: addDays(t, -6), to: t }) },
  { key: "30d", label: "Last 30 days", range: (t) => ({ from: addDays(t, -29), to: t }) },
  { key: "90d", label: "Last 90 days", range: (t) => ({ from: addDays(t, -89), to: t }) },
  { key: "this_month", label: "This month", range: (t) => ({ from: startOfMonth(t), to: t }) },
  {
    key: "last_month",
    label: "Last month",
    range: (t) => {
      const start = addMonths(t, -1);
      return { from: start, to: endOfMonth(start) };
    },
  },
  { key: "12m", label: "Last 12 months", range: (t) => ({ from: addDays(t, -364), to: t }) },
  { key: "this_year", label: "This year", range: (t) => ({ from: `${t.slice(0, 4)}-01-01`, to: t }) },
  { key: "all", label: "All time", range: (t) => ({ from: FIRST_DAY, to: t }) },
];

export const presetByKey = (k: string | undefined | null) => PRESETS.find((p) => p.key === k);

const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** A clean range: in order, not past today, not before the first day. */
export const clampRange = (r: DayRange, today = todayKey()): DayRange => {
  let { from, to } = r;
  if (from > to) [from, to] = [to, from];
  if (to > today) to = today;
  if (from > to) from = to;
  if (from < FIRST_DAY) from = FIRST_DAY;
  return { from, to };
};

const calendar = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options });

/** "25 Oct – 23 Nov 2026", "3 – 19 Nov 2026", "23 Nov 2026". */
export const formatRange = (r: DayRange) => {
  const from = parse(r.from);
  const to = parse(r.to);
  if (r.from === r.to) return calendar({ day: "numeric", month: "short", year: "numeric" }).format(to);
  const sameYear = r.from.slice(0, 4) === r.to.slice(0, 4);
  const sameMonth = sameYear && r.from.slice(0, 7) === r.to.slice(0, 7);
  const start = sameMonth
    ? calendar({ day: "numeric" }).format(from)
    : calendar(sameYear ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" }).format(
        from
      );
  return `${start} – ${calendar({ day: "numeric", month: "short", year: "numeric" }).format(to)}`;
};

/** The preset this range matches today, if any. */
export const matchPreset = (r: DayRange, today = todayKey()): Preset | undefined =>
  PRESETS.find((p) => {
    const pr = p.range(today);
    return pr.from === r.from && pr.to === r.to;
  });

/** "Last 30 days" or "3 – 19 Nov 2026". */
export const rangeName = (r: DayRange, today = todayKey()) => matchPreset(r, today)?.label ?? formatRange(r);

/** "in the last 30 days", "today", "between 3 and 19 Nov 2026". */
export const rangePhrase = (r: DayRange, today = todayKey()) => {
  const p = matchPreset(r, today);
  if (p?.key === "today") return "today";
  if (p?.key === "yesterday") return "yesterday";
  if (p?.key === "all") return "since launch";
  if (p) return `in the ${p.label.toLowerCase()}`.replace("the this", "this");
  if (r.from === r.to) return `on ${formatRange(r)}`;
  return `from ${formatRange(r)}`;
};

/** The same length of time just before (dir -1) or after (+1); null when it would pass today. */
export const shiftRange = (r: DayRange, dir: -1 | 1, today = todayKey()): DayRange | null => {
  const p = matchPreset(r, today);
  // Whole months move by a month.
  if (r.from === startOfMonth(r.from) && (r.to === endOfMonth(r.from) || p?.key === "this_month")) {
    const from = addMonths(r.from, dir);
    if (from > today) return null;
    const to = endOfMonth(from) > today ? today : endOfMonth(from);
    if (dir === -1 && from < startOfMonth(FIRST_DAY)) return null;
    return { from, to };
  }
  const n = daysIn(r);
  const from = addDays(r.from, dir * n);
  const to = addDays(r.to, dir * n);
  if (from > today) return null;
  if (to < FIRST_DAY) return null;
  return clampRange({ from, to }, today);
};

/**
 * The range in the address bar: `range=30d` for a preset (so a saved link stays "the last 30
 * days"), or `from` and `to` for custom dates.
 */
export const readRange = (
  query: Record<string, string | string[] | undefined>,
  fallback: PresetKey,
  today = todayKey()
): DayRange => {
  const preset = presetByKey(typeof query.range === "string" ? query.range : undefined);
  if (preset) return preset.range(today);
  if (isDay(query.from) && isDay(query.to)) return clampRange({ from: query.from, to: query.to }, today);
  return presetByKey(fallback)!.range(today);
};

/** Address-bar values for a range (a preset name when it matches one). */
export const rangeQuery = (r: DayRange, today = todayKey()) => {
  const p = matchPreset(r, today);
  return p ? { range: p.key, from: undefined, to: undefined } : { range: undefined, from: r.from, to: r.to };
};
