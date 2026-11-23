import Cookies from "js-cookie";
import { API_BASE_URL, accessToken } from "@/constants";

/**
 * Product events: what students do in the app, sent in small batches so the team (and Claude)
 * can see where people get stuck. Never throws, never slows the app, and skips the admin.
 */

export type EventName =
  | "page_view"
  | "page_leave"
  | "signed_up"
  | "signed_in"
  | "email_confirmed"
  | "upload_started"
  | "upload_done"
  | "upload_failed"
  | "test_generate_started"
  | "test_generate_done"
  | "test_generate_failed"
  | "test_opened"
  | "test_left"
  | "test_submitted"
  | "chat_sent"
  | "chat_first_text"
  | "chat_done"
  | "chat_stopped"
  | "chat_failed"
  | "chat_retry"
  | "easy_read_opened"
  | "limit_hit"
  | "upgrade_shown"
  | "checkout_started"
  | "checkout_result"
  | "api_error"
  | "js_error"
  | "survey_answer";

type Props = Record<string, string | number | boolean | null | undefined>;

interface QueuedEvent {
  name: EventName;
  at: number;
  path?: string;
  ms?: number;
  props?: Record<string, string | number | boolean>;
}

const SESSION_KEY = "aix-session";
const ANON_KEY = "aix-anon";
const IDLE_MS = 30 * 60_000;
const FLUSH_MS = 4_000;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let off = false;
/** The Next route pattern ("/questions/view-questions/[id]"), set by the page tracker. */
let route: string | null = null;

const read = (k: string) => {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    // Private mode: ids just won't last between visits.
  }
};
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

let memorySession: { id: string; last: number } | null = null;
/** One visit: a new one starts after 30 minutes away. */
const sessionId = () => {
  const now = Date.now();
  let s = memorySession;
  if (!s) {
    try {
      s = JSON.parse(read(SESSION_KEY) || "null");
    } catch {
      s = null;
    }
  }
  if (!s?.id || now - s.last > IDLE_MS) s = { id: newId(), last: now };
  s.last = now;
  memorySession = s;
  write(SESSION_KEY, JSON.stringify(s));
  return s.id;
};

const anonId = () => {
  let id = read(ANON_KEY);
  if (!id) {
    id = newId();
    write(ANON_KEY, id);
  }
  return id;
};

const clean = (props?: Props) => {
  if (!props) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue;
    out[k] = typeof v === "string" ? v.slice(0, 300) : v;
  }
  return Object.keys(out).length ? out : undefined;
};

const skip = () => typeof window === "undefined" || off || window.location.pathname.startsWith("/admin");

export const setRoute = (pattern: string) => {
  route = pattern;
};

/** Records one event. `ms` is for how long something took or lasted. */
export const track = (name: EventName, props?: Props, ms?: number) => {
  if (skip()) return;
  queue.push({
    name,
    at: Date.now(),
    path: route ?? window.location.pathname,
    ms: typeof ms === "number" && Number.isFinite(ms) ? Math.max(0, Math.round(ms)) : undefined,
    props: clean(props),
  });
  if (queue.length >= 20) flush();
  else if (!timer) timer = setTimeout(() => flush(), FLUSH_MS);
};

/** Sends what's queued. `leaving` keeps the request alive while the page closes. */
export const flush = (leaving = false) => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length || typeof window === "undefined" || off) return;
  const events = queue.splice(0, 50);
  const token = Cookies.get(accessToken);
  try {
    fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      keepalive: leaving,
      headers: { "Content-Type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ sessionId: sessionId(), anonId: anonId(), events }),
    })
      .then((res) => {
        // A server without the endpoint yet: stop trying for this visit.
        if (res.status === 404) off = true;
      })
      .catch(() => undefined);
  } catch {
    // Never let tracking break the page.
  }
  if (queue.length && !timer) timer = setTimeout(() => flush(), FLUSH_MS);
};

/** Starts a stopwatch: `const took = stopwatch(); … track("x", {}, took())`. */
export const stopwatch = () => {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  return () => (typeof performance !== "undefined" ? performance.now() : Date.now()) - start;
};

/** A short reason from an RTK Query or fetch error, without personal details. */
export const reasonOf = (error: unknown) => {
  const e = error as { status?: unknown; data?: { message?: unknown }; message?: unknown };
  const status = typeof e?.status === "number" || typeof e?.status === "string" ? String(e.status) : "";
  const message = typeof e?.data?.message === "string" ? e.data.message : typeof e?.message === "string" ? e.message : "";
  return [status, message.replace(/\S+@\S+/g, "[email]").slice(0, 160)].filter(Boolean).join(" ") || "unknown";
};
