/**
 * Admin dashboard, activity and marketing campaigns: the API contract
 * (redesign/admin/API.md). CampaignContent, TemplateKey and ColorSet are copied from the backend's
 * src/integrations/mailer/marketing/types.ts; keep them in step.
 */

/* ---------- Marketing email content (copied from the backend) ---------- */

export type TemplateKey =
  | "announcement"
  | "newsletter"
  | "offer"
  | "spotlight"
  | "comeback"
  | "live"
  | "letter";

/** Two-colour sets the admin can pick in the editor (first colour leads, second accents). */
export type ColorSet = "ink_yellow" | "yellow_ink" | "purple_cream" | "white_purple";

export interface ContentItem {
  title: string;
  text: string;
}

export interface CampaignContent {
  colorSet: ColorSet;
  headline: string;
  /** A word or phrase inside `headline` to set on the yellow marker. Optional. */
  highlight?: string;
  /** The short line under the headline (announcement and spotlight heroes, the newsletter's
   *  lead story). Optional. */
  subhead?: string;
  /** Paragraphs separated by a blank line. May contain {first name}. */
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  button?: { label: string; url: string };
  /** Numbered highlights (announcement), tips (newsletter), steps (spotlight), what you get
   *  (offer), what's new (comeback), agenda (live: title = time, text = what). */
  items?: ContentItem[];
  /** The heading over `items`, e.g. "Three taps to try it". Optional: each template has a fallback. */
  itemsTitle?: string;
  /** Newsletter quote block. */
  quote?: { text: string; by: string };
  /** Newsletter: two colour-block cards. */
  cards?: { title: string; text: string; linkLabel: string; url: string }[];
  /** Offer template. */
  offer?: {
    intro: string;
    big: string;
    line: string;
    deadline: string;
    deadlineNote?: string;
    code?: string;
    fineprint?: string;
  };
  /** Live session template. */
  event?: {
    weekday: string;
    day: string;
    month: string;
    time: string;
    host: string;
    hostRole: string;
    calendarUrl?: string;
  };
  /** Spotlight template: the same paragraph before and after Easy Read. */
  beforeAfter?: { before: string; after: string };
  /** Come back template: the card naming where they left off. */
  resume?: { title: string; subtitle: string; progress?: number; buttonLabel: string; url: string };
  /** Newsletter masthead line, e.g. "No. 11 · November 2026". */
  issueLabel?: string;
  /** e.g. "Happy studying," (the team name is added on the next line). */
  signoff?: string;
}

/* ---------- Activity ---------- */

export type ActivityType =
  | "sign_in"
  | "sign_up"
  | "upload"
  | "test_generated"
  | "test_finished"
  | "easy_read"
  | "viva"
  | "chat"
  | "purchase";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  /** "Ada Okafor"; "Guest" for guest accounts. */
  userName: string;
  /** Human sentence without the name: "uploaded Renal Pharmacology.pdf (36 pages)". */
  detail: string;
  createdOn: string;
}

export interface AdminMe {
  isAdmin: boolean;
  /** Set on the server (ADMIN_EMAILS): can add and remove admins. */
  isOwner?: boolean;
}

export interface AdminTeamMember {
  email: string;
  /** Set on the server: can add and remove admins, can't be removed here. */
  owner: boolean;
  /** Their AI Examiner account, when they have one. */
  userId: string | null;
  name: string | null;
  initials: string;
  addedBy: string | null;
  addedOn: string | null;
}

export interface AdminTeam {
  /** True for owners: they can add and remove admins. */
  canManage: boolean;
  /** The viewer's own email. */
  you: string;
  admins: AdminTeamMember[];
}

export interface HeartbeatPayload {
  /** ≤140 chars, e.g. "Reading in Easy Read · Renal Pharmacology". */
  doing?: string | null;
  path?: string;
}

/* ---------- Dashboard ---------- */

/** Whole Lagos days, both included: "2026-10-25" to "2026-11-23". */
export interface DayRange {
  from: string;
  to: string;
}

export type Granularity = "day" | "week" | "month";

export type MetricKey =
  | "active"
  | "signUps"
  | "uploads"
  | "testsMade"
  | "testsFinished"
  | "vivas"
  | "chats"
  | "payments"
  | "revenue"
  | "revenueUsd"
  /** Seconds read in Easy Read. */
  | "reading";

export interface Metric {
  total: number;
  previous: number;
  /** One value per bucket. */
  series: number[];
  /** One value per previous-period bucket. */
  previousSeries: number[];
}

/** One chart point: the days it covers, both included. */
export interface Bucket {
  start: string;
  end: string;
}

export interface AdminAnalytics {
  generatedAt: string;
  range: DayRange & { days: number };
  previous: DayRange & { days: number };
  granularity: Granularity;
  granularities: Granularity[];
  buckets: Bucket[];
  previousBuckets: Bucket[];
  metrics: Record<MetricKey, Metric>;
  extras: {
    averageDailyActive: number;
    previousAverageDailyActive: number;
    googleSignUps: number;
    signUps: number;
    guests: number;
    averageScore: number | null;
    previousAverageScore: number | null;
    /** Share of finished tests scoring 50% or more. */
    passRate: number | null;
    signIns: number;
    easyReadOpens: number;
    vivasFinished: number;
    /** False when Paystack couldn't be reached: revenue and payments read as unknown. */
    revenueAvailable: boolean;
  };
  /** What this period's sign-ups went on to do, so far. */
  funnel: { key: string; label: string; count: number }[];
  /** Sign-up weeks (Mondays): how many came back in each of the 8 weeks after (null = not yet). */
  cohorts: { week: string; size: number; weeks: (number | null)[] }[];
  features: { key: string; label: string; count: number; previous: number }[];
  /** [Monday..Sunday][hour 0..23], Lagos time. */
  heatmap: number[][];
  /** Finished tests by score: 0–9, 10–19 … 90–99, 100. */
  scores: { buckets: number[]; count: number };
  /** Time spent reading in Easy Read (the total per bucket is `metrics.reading`). */
  easyRead: {
    /** The first day reading time was recorded, or null before any. */
    since: string | null;
    readers: number;
    previousReaders: number;
    sessions: number;
    previousSessions: number;
    documents: { documentId: string; title: string; seconds: number; readers: number }[];
    topReaders: { userId: string; name: string; initials: string; seconds: number; documents: number; days: number }[];
  };
  topStudents: {
    userId: string;
    name: string;
    initials: string;
    actions: number;
    tests: number;
    uploads: number;
    finished: number;
    chats: number;
    /** Documents read in Easy Read (one per document per day). */
    reads: number;
    readingSeconds: number;
  }[];
}

export interface AdminLive {
  generatedAt: string;
  onlineNow: number;
  readingNow: number;
  activeToday: number;
  signUpsToday: number;
  /** Up to 30, most recent first. */
  online: {
    userId: string;
    name: string;
    initials: string;
    doing: string | null;
    since: string;
    lastSeenAt: string;
  }[];
  /** Latest 12. */
  feed: ActivityItem[];
}

export type UserSegment =
  | "all"
  | "online"
  | "active_today"
  | "active_7d"
  | "active_30d"
  | "inactive_30d"
  | "never_used";

export type UserPlan = "free" | "paid" | "guest";

export type UserSort =
  | "last_active"
  | "created_on"
  | "name"
  | "documents"
  | "tests"
  | "finished"
  | "score"
  | "reading";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string | null;
  role: "user" | "guest";
  plan: UserPlan;
  online: boolean;
  lastSeenAt: string | null;
  createdOn: string | null;
  documents: number;
  tests: number;
  testsFinished: number;
  /** 0-100, or null before any finished test. */
  averageScore: number | null;
  /** Seconds read in Easy Read, all time. */
  readingSeconds: number;
}

export interface AdminUsersQuery {
  search?: string;
  segment?: UserSegment;
  plan?: UserPlan | "";
  joinedFrom?: string;
  joinedTo?: string;
  sort?: UserSort;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface AdminUsersResponse {
  total: number;
  page: number;
  pageSize: number;
  counts: { registered: number; guests: number; online: number; paid: number; active30d: number };
  users: AdminUserRow[];
}

export interface AdminUserDetail {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    institution: string | null;
    role: "user" | "guest";
    plan: UserPlan;
    /** e.g. "Quarterly" when known. */
    planName: string | null;
    /** False while an email sign-up waits for its confirmation link to be opened. */
    emailConfirmed?: boolean;
    createdOn: string | null;
    online: boolean;
    doing: string | null;
    lastSeenAt: string | null;
  };
  stats: {
    documents: number;
    tests: number;
    /** 0-100. */
    averageScore: number | null;
    easyReadSecondsThisMonth: number;
    vivas: number;
    chatQuestions: number;
  };
  marketing: { subscribed: boolean };
  /** Minutes of oral viva time left, or null. */
  callCredits: number | null;
  /** Newest day first, last 60 events. */
  days: { date: string; items: ActivityItem[] }[];
  /** Last 5. */
  signIns: { createdOn: string; device: string | null }[];
  /** Easy Read reading time, recorded for every plan. */
  easyRead: {
    seconds: number;
    secondsThisMonth: number;
    sessions: number;
    documents: number;
    lastReadAt: string | null;
    top: { documentId: string; title: string; seconds: number }[];
  };
  /** Actions per Lagos day over the last year; days with none are left out. */
  calendar: { day: string; count: number }[];
}

export interface AdminActivityQuery {
  from: string;
  to: string;
  /** Kinds to show (none = all). */
  types?: ActivityType[];
  search?: string;
  /** One person, picked from the search. */
  userId?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "oldest";
}

export interface AdminActivityResponse {
  total: number;
  people: number;
  page: number;
  pageSize: number;
  items: ActivityItem[];
}

export interface AdminActivitySummary {
  range: DayRange & { days: number };
  /** Every kind, whatever kinds are picked (so the menu can show counts). */
  byType: Record<ActivityType, number>;
  /** Volume over time, every kind per bucket. */
  histogram: {
    unit: "hour" | "day" | "week";
    buckets: { start: string; counts: Partial<Record<ActivityType, number>> }[];
  };
}

/* ---------- Campaigns ---------- */

export type Audience = "all" | "active_30d" | "inactive_30d" | "free" | "paid";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "paused" | "sent";

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  templateKey: TemplateKey;
  content: CampaignContent;
  audience: Audience;
  status: CampaignStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  /** People who clicked at least once. */
  clickCount: number;
  /** People who unsubscribed from this campaign's link. */
  unsubscribeCount: number;
  testSentAt: string | null;
  createdOn: string;
  updatedOn: string;
  /** While scheduled / sending / paused. */
  estimate: { finishesOn: string | null; days: number } | null;
}

export type CampaignField = keyof CampaignContent;

export interface CampaignTemplate {
  key: TemplateKey;
  title: string;
  use: string;
  /** Drives which inputs the editor shows. */
  fields: CampaignField[];
  defaults: CampaignContent;
  defaultSubject: string;
  defaultPreheader: string;
}

export interface CampaignsResponse {
  counts: Record<"all" | CampaignStatus, number>;
  /** Registered users who can get marketing email. */
  subscribed: number;
  unsubscribed: number;
  /** 400. */
  dailyLimit: number;
  /** Marketing emails sent today, all campaigns. */
  usedToday: number;
  /** Newest first. */
  campaigns: Campaign[];
}

export interface UpdateCampaignPayload {
  name?: string;
  subject?: string;
  preheader?: string;
  templateKey?: TemplateKey;
  content?: CampaignContent;
  audience?: Audience;
}

export interface CampaignPreviewPayload {
  subject?: string;
  preheader?: string;
  templateKey?: TemplateKey;
  content?: CampaignContent;
}

export interface CampaignPreview {
  html: string;
  text: string;
}

export interface AudienceOption {
  key: Audience;
  label: string;
  count: number;
}

export interface CampaignEstimate {
  recipients: number;
  days: number;
  dailyLimit: number;
  startsOn: string;
  finishesOn: string;
}

export interface CampaignReport {
  campaign: Campaign;
  /** Sent days, today, then the planned queue. */
  days: { date: string; count: number; status: "sent" | "today" | "queued" }[];
  links: { label: string; url: string; clicks: number }[];
  bounces: { count: number; items: { email: string; reason: string }[] };
}

/* ---------- Public email links ---------- */

export type UnsubscribeReason = "too_many" | "not_useful" | "stopped_using" | "other";

export interface EmailPreferences {
  email: string;
  subscribed: boolean;
}
