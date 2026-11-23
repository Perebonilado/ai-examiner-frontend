import { ActivityType, CampaignStatus, UserPlan } from "@/models/admin.model";

/** Flat colour pops for chips and avatars. Each pair reads in light and dark. */
export const TONES = {
  violet: "bg-accent-100 text-accent-900",
  sky: "bg-[#e0f2fe] text-[#075985] dark:bg-[#0c2a3d] dark:text-[#9dd7f7]",
  yellow: "bg-[#fbf1cc] text-[#6b4e00] dark:bg-[#2e2610] dark:text-[#f2d27a]",
  coral: "bg-[#fde7e4] text-[#8f1d14] dark:bg-[#35171a] dark:text-[#ffb3ac]",
  grey: "bg-hover text-body",
  green: "bg-success-bg text-success-strong",
  ink: "bg-inverse text-on-inverse",
  amber: "bg-warning-bg text-[#7a4800] dark:text-warning",
  teal: "bg-[#d8f3ea] text-[#0b5e43] dark:bg-[#0f2a22] dark:text-[#7fdcbc]",
  pink: "bg-[#fde4ee] text-[#8a1f4b] dark:bg-[#36141f] dark:text-[#ffb1cd]",
} as const;

export type Tone = keyof typeof TONES;

/**
 * Activity kinds grouped for charts: seven colours, in an order checked for colour-blind
 * separation (dataviz validator, light and dark). Chips use the matching tone.
 */
export type ActivityGroup = "accounts" | "uploads" | "vivas" | "tests" | "easy_read" | "chat" | "purchases";

export const ACTIVITY_GROUPS: { key: ActivityGroup; label: string; color: string; types: ActivityType[] }[] = [
  { key: "accounts", label: "Sign-ups and sign-ins", color: "var(--viz-1)", types: ["sign_up", "sign_in"] },
  { key: "uploads", label: "Uploads", color: "var(--viz-2)", types: ["upload"] },
  { key: "vivas", label: "Vivas", color: "var(--viz-3)", types: ["viva"] },
  { key: "tests", label: "Tests", color: "var(--viz-4)", types: ["test_generated", "test_finished"] },
  { key: "easy_read", label: "Easy Read", color: "var(--viz-5)", types: ["easy_read"] },
  { key: "chat", label: "Chat", color: "var(--viz-6)", types: ["chat"] },
  { key: "purchases", label: "Purchases", color: "var(--viz-7)", types: ["purchase"] },
];

export const groupOf = (type: ActivityType) => ACTIVITY_GROUPS.find((g) => g.types.includes(type))!;

export const ACTIVITY_TYPES: Record<ActivityType, { chip: string; tone: Tone; label: string }> = {
  sign_up: { chip: "Sign-up", tone: "teal", label: "Sign-ups" },
  sign_in: { chip: "Sign-in", tone: "teal", label: "Sign-ins" },
  upload: { chip: "Upload", tone: "sky", label: "Uploads" },
  test_generated: { chip: "Test made", tone: "violet", label: "Tests made" },
  test_finished: { chip: "Test done", tone: "violet", label: "Tests finished" },
  viva: { chip: "Viva", tone: "coral", label: "Vivas" },
  easy_read: { chip: "Easy Read", tone: "yellow", label: "Easy Read" },
  chat: { chip: "Chat", tone: "pink", label: "Chat questions" },
  purchase: { chip: "Purchase", tone: "green", label: "Purchases" },
};

/** Every kind, in chart order. */
export const ACTIVITY_ORDER: ActivityType[] = ACTIVITY_GROUPS.flatMap((g) => g.types);

export const AVATAR_TONES: Tone[] = ["violet", "yellow", "sky", "green", "coral", "grey"];

/** The same person always gets the same avatar colour. */
export const avatarTone = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TONES[AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length]];
};

export const PLAN_CHIPS: Record<UserPlan, { label: string; tone: Tone }> = {
  free: { label: "Free", tone: "grey" },
  paid: { label: "Paid", tone: "violet" },
  guest: { label: "Guest", tone: "amber" },
};

export const STATUS_CHIPS: Record<CampaignStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "grey" },
  scheduled: { label: "Scheduled", tone: "sky" },
  sending: { label: "Sending", tone: "violet" },
  paused: { label: "Paused", tone: "amber" },
  sent: { label: "Sent", tone: "green" },
};
