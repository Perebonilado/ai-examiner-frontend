/**
 * Dates, times and numbers for the admin pages. "Today" and every day boundary use Lagos time
 * (WAT), the same as the API, whatever time zone the admin's computer is in.
 */

export const ADMIN_TIME_ZONE = "Africa/Lagos";
/** WAT is UTC+1 all year (no daylight saving). */
const LAGOS_OFFSET = "+01:00";

type DateOptions = Intl.DateTimeFormatOptions;

const lagos = (options: DateOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: ADMIN_TIME_ZONE, ...options });

/** A calendar date ("2026-11-22") formatted as itself, never shifted by a time zone. */
const calendar = (options: DateOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options });
const fromKey = (key: string) => new Date(`${key.slice(0, 10)}T12:00:00Z`);

export const formatNumber = (value: number) => value.toLocaleString("en-GB");

/** "YYYY-MM-DD" of an instant, in Lagos. */
export const lagosDateKey = (value: Date | string) => {
  const parts = lagos({ year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(
    typeof value === "string" ? new Date(value) : value
  );
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

const shiftKey = (key: string, days: number) => {
  const d = fromKey(key);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** "09:41" */
export const formatTime = (iso: string) =>
  lagos({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));

/** "12 Mar 2026" */
export const formatDate = (iso: string) =>
  lagos({ day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

/** "Sunday 22 November" (today, in Lagos). */
export const formatLongToday = (now = new Date()) =>
  lagos({ weekday: "long", day: "numeric", month: "long" }).format(now);

/** Calendar dates from the API ("2026-11-22"). */
export const formatKey = {
  /** "22 Nov" */
  dayMonth: (key: string) => calendar({ day: "numeric", month: "short" }).format(fromKey(key)),
  /** "Sun 22 Nov" */
  weekdayDayMonth: (key: string) =>
    calendar({ weekday: "short", day: "numeric", month: "short" }).format(fromKey(key)),
  /** "Sunday 22 November" */
  long: (key: string) =>
    calendar({ weekday: "long", day: "numeric", month: "long" }).format(fromKey(key)),
  /** "Monday" */
  weekday: (key: string) => calendar({ weekday: "long" }).format(fromKey(key)),
};

/** "Today", "Yesterday" or "Fri 20 Nov" for a calendar date. */
export const dayLabel = (key: string, now = new Date()) => {
  const today = lagosDateKey(now);
  if (key.slice(0, 10) === today) return "Today";
  if (key.slice(0, 10) === shiftKey(today, -1)) return "Yesterday";
  return formatKey.weekdayDayMonth(key);
};

/** "Today, 09:38", "Yesterday, 20:31" or "20 Nov, 07:15". */
export const formatDayAndTime = (iso: string, now = new Date()) => {
  const key = lagosDateKey(iso);
  const label = dayLabel(key, now);
  const day = label === "Today" || label === "Yesterday" ? label : formatKey.dayMonth(key);
  return `${day}, ${formatTime(iso)}`;
};

/** "just now", "4 min ago", "2 hours ago", "Yesterday", "3 days ago", then a date. */
export const relativeTime = (iso: string | null, now = new Date()) => {
  if (!iso) return "Never";
  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const today = lagosDateKey(now);
  const key = lagosDateKey(iso);
  if (key === today) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (key === shiftKey(today, -1)) return "Yesterday";
  const days = Math.round((fromKey(today).getTime() - fromKey(key).getTime()) / 86_400_000);
  if (days < 60) return `${days} days ago`;
  return formatDate(iso);
};

/** "Today" when the date is today in Lagos, else "12 Mar 2026". */
export const formatJoined = (iso: string | null, now = new Date()) => {
  if (!iso) return "–";
  return lagosDateKey(iso) === lagosDateKey(now) ? "Today" : formatDate(iso);
};

/** "4 h 12 m", "35 m", "0 m". */
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours} h ${minutes % 60} m`;
  return `${minutes} m`;
};

/** Reading time: "45 s", "12 min", "3 h 05 min", "1,240 h". */
export const formatReading = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  const minutes = Math.round(s / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours >= 100) return `${hours.toLocaleString("en-GB")} h`;
  return `${hours} h ${String(minutes % 60).padStart(2, "0")} min`;
};

/** A day ("2026-11-24") and time ("08:00") in Lagos as an ISO instant. */
export const lagosToIso = (dateKey: string, time: string) =>
  new Date(`${dateKey}T${time.length === 5 ? `${time}:00` : time}${LAGOS_OFFSET}`).toISOString();

/** The Lagos day and time of an instant, for date and time inputs. */
export const isoToLagosInputs = (iso: string) => ({ date: lagosDateKey(iso), time: formatTime(iso) });

/** Tomorrow at 08:00 in Lagos, the default for "Schedule". */
export const defaultScheduleInputs = (now = new Date()) => ({
  date: shiftKey(lagosDateKey(now), 1),
  time: "08:00",
});

export const todayKey = (now = new Date()) => lagosDateKey(now);

export interface Delta {
  text: string;
  /** "Up" / "Down" for screen readers; the arrow itself is hidden. */
  direction: "up" | "down" | "same";
}

/** "▲ 11% on yesterday" (green), "▼ 13% on yesterday" (red), or no change (neutral). */
export const compareWithYesterday = (today: number, yesterday: number): Delta => {
  if (today === yesterday) return { text: "Same as yesterday", direction: "same" };
  if (yesterday === 0) return { text: "from none yesterday", direction: "up" };
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  if (pct === 0) return { text: "Same as yesterday", direction: "same" };
  return { text: `${Math.abs(pct)}% on yesterday`, direction: pct > 0 ? "up" : "down" };
};

/** "AO" from "Ada Okafor"; "G" for guests. */
export const initialsOf = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words[0].toLowerCase() === "guest") return "G";
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
};

/** First letter upper-case: the API's details are sentences without the name. */
export const sentenceCase = (text: string) => (text ? text[0].toUpperCase() + text.slice(1) : text);

/** "aiexaminer.app/documents" from "https://aiexaminer.app/documents". */
export const shortUrl = (url: string) => {
  try {
    const u = new URL(url);
    const path = `${u.pathname}${u.search}${u.hash}`.replace(/\/$/, "");
    return `${u.host.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
};
