import { Audience, AudienceOption, Campaign, ColorSet } from "@/models/admin.model";
import { formatKey, formatNumber, formatTime, lagosDateKey, relativeTime } from "../format";

export const AUDIENCE_LABELS: Record<Audience, string> = {
  all: "Everyone subscribed",
  active_30d: "Active in the last 30 days",
  inactive_30d: "Not seen in 30 days",
  free: "Free plan",
  paid: "Paid plans",
};

export const audienceLabel = (audience: Audience, options?: AudienceOption[]) =>
  options?.find((o) => o.key === audience)?.label ?? AUDIENCE_LABELS[audience] ?? audience;

/** The email's two colours for each colour set: `lead` fills the hero, `accent` marks and buttons. */
export const COLOR_SETS: { key: ColorSet; label: string; lead: string; onLead: string; accent: string; onAccent: string }[] = [
  { key: "ink_yellow", label: "Black and yellow", lead: "#0e0e10", onLead: "#ffffff", accent: "#f4cb5a", onAccent: "#0e0e10" },
  { key: "yellow_ink", label: "Yellow and black", lead: "#f4cb5a", onLead: "#0e0e10", accent: "#0e0e10", onAccent: "#ffffff" },
  { key: "purple_cream", label: "Purple and cream", lead: "#5b2ad6", onLead: "#ffffff", accent: "#fbf1cc", onAccent: "#0e0e10" },
  { key: "white_purple", label: "White and purple", lead: "#ffffff", onLead: "#0e0e10", accent: "#5b2ad6", onAccent: "#ffffff" },
];

export const colorSetOf = (key: ColorSet | undefined) => COLOR_SETS.find((c) => c.key === key) ?? COLOR_SETS[0];

/** Where a campaign row leads: drafts to the editor, scheduled to review, the rest to the report. */
export const campaignHref = (c: Pick<Campaign, "id" | "status">) =>
  c.status === "draft"
    ? `/admin/campaigns/${c.id}/edit`
    : c.status === "scheduled"
    ? `/admin/campaigns/${c.id}/review`
    : `/admin/campaigns/${c.id}`;

/** "Mon 24 Nov, 08:00" for an instant, in Lagos. */
export const formatWhen = (iso: string) => `${formatKey.weekdayDayMonth(lagosDateKey(iso))}, ${formatTime(iso)}`;

/** The line under a campaign's status chip. */
export const campaignStatusLine = (c: Campaign, now = new Date()) => {
  const sent = `${formatNumber(c.sentCount)} of ${formatNumber(c.totalRecipients)} sent`;
  switch (c.status) {
    case "sending":
      return c.estimate?.finishesOn ? `${sent} · done ${formatKey.weekdayDayMonth(c.estimate.finishesOn)}` : sent;
    case "paused":
      return sent;
    case "scheduled":
      return c.scheduledAt ? formatWhen(c.scheduledAt) : "Waiting to start";
    case "sent":
      return `${c.finishedAt ? `${formatKey.dayMonth(lagosDateKey(c.finishedAt))} · ` : ""}${formatNumber(c.sentCount)} sent`;
    default:
      return `Edited ${relativeTime(c.updatedOn, now)}`;
  }
};

export const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** "15.5%", to one decimal place. */
export const pctLabel = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 1000) / 10}%` : "0%";

/** "/pricing#plans" from a full link, for lists of links in one email. */
export const shortPath = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.hash}` || "/";
  } catch {
    return url;
  }
};
