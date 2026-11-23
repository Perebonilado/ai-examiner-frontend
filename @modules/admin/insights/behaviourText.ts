import { TimelineEvent } from "@/models/insights.model";

/** Page routes in words. */
const PAGES: [RegExp, string][] = [
  [/^\/$/, "Home page"],
  [/^\/new-document$/, "Upload page"],
  [/^\/documents$/, "Documents"],
  [/^\/questions\/view-questions\//, "A document"],
  [/^\/questions\/practise-questions\/multiple-choice\//, "Multiple choice test"],
  [/^\/questions\/practise-questions\/multiple-true-false\//, "True/false test"],
  [/^\/questions\/practise-questions\/flash-cards\//, "Flashcards"],
  [/^\/questions\/practise-questions\/essay\//, "Essay"],
  [/^\/questions\/practise-questions\/oral/, "Oral viva"],
  [/^\/questions\/shared\//, "Shared test"],
  [/^\/easy-read\//, "Easy Read"],
  [/^\/sprint-read/, "Sprint Read"],
  [/^\/performance-tracking/, "Performance"],
  [/^\/pricing$/, "Pricing"],
  [/^\/payment-confirmation$/, "Payment confirmation"],
  [/^\/auth\/login$/, "Log in"],
  [/^\/auth\/signup$/, "Sign up"],
  [/^\/auth\//, "Account access"],
  [/^\/account/, "Account"],
];

export const pageName = (path: string | null | undefined) => {
  if (!path) return "Unknown page";
  return PAGES.find(([re]) => re.test(path))?.[1] ?? path;
};

/** "1.4 s", "38 s", "2 min 5 s". */
export const duration = (ms: number | null | undefined) => {
  if (ms === null || ms === undefined) return "–";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(1)} s`;
  if (s < 60) return `${Math.round(s)} s`;
  const m = Math.floor(s / 60);
  return `${m} min${Math.round(s % 60) ? ` ${Math.round(s % 60)} s` : ""}`;
};

const TEST = (t: unknown) =>
  ({ "multiple-choice": "multiple choice", "multiple-true-false": "true/false", "flash-cards": "flashcards", essay: "essay", viva: "oral viva", "3": "multiple choice", "4": "flashcards", "5": "true/false", "6": "oral viva", "7": "essay" } as Record<string, string>)[String(t)] ?? "test";

/** One event as a sentence, plus whether it's a problem worth highlighting. */
export const describe = (e: TimelineEvent): { text: string; tone: "plain" | "good" | "bad" | "quiet" } => {
  const p = e.props ?? {};
  switch (e.name) {
    case "page_view":
      return { text: `Opened ${pageName(e.path)}`, tone: "plain" };
    case "page_leave":
      return { text: `Left ${pageName(String(p.page ?? e.path))} after ${duration(e.ms)}`, tone: "quiet" };
    case "signed_up":
      return { text: `Signed up${p.method ? ` (${String(p.method).replace("_", " ")})` : ""}`, tone: "good" };
    case "signed_in":
      return { text: `Signed in${p.method ? ` (${p.method})` : ""}`, tone: "plain" };
    case "upload_started":
      return { text: `Started uploading a ${p.type || "file"}${p.kb ? ` (${p.kb} KB)` : ""}`, tone: "plain" };
    case "upload_done":
      return { text: `Upload finished in ${duration(e.ms)}${p.topics !== undefined ? ` · ${p.topics} topics found` : ""}`, tone: "good" };
    case "upload_failed":
      return { text: `Upload failed: ${p.reason === "too_large" ? `file too large (limit ${p.limitMb} MB)` : p.reason ?? "unknown reason"}`, tone: "bad" };
    case "test_generate_started":
      return { text: `Asked for a ${TEST(p.type)} test${p.count ? ` of ${p.count} questions` : ""}`, tone: "plain" };
    case "test_generate_done":
      return { text: `Test ready in ${duration(e.ms)}`, tone: "good" };
    case "test_generate_failed":
      return { text: `Test couldn’t be made: ${p.reason ?? "unknown reason"}`, tone: "bad" };
    case "test_opened":
      return { text: `Opened a ${TEST(p.type)} test${p.resumed ? " (carrying on)" : ""}`, tone: "plain" };
    case "test_left":
      return {
        text:
          p.reason === "call_error"
            ? "The viva call failed"
            : `Left a ${TEST(p.type)} test at ${p.answered} of ${p.total} after ${duration(e.ms)}`,
        tone: "bad",
      };
    case "test_submitted":
      return {
        text:
          p.type === "essay" && p.blank
            ? "Submitted an essay with nothing written"
            : `Finished a ${TEST(p.type)} test${p.score !== undefined ? ` · ${p.score}%` : ""} in ${duration(e.ms)}`,
        tone: p.blank ? "bad" : "good",
      };
    case "chat_sent":
      return { text: `Asked the chat a question${p.mode && p.mode !== "typed" ? ` (${String(p.mode).replace("_", " ")})` : ""}`, tone: "plain" };
    case "chat_first_text":
      return { text: `First words of the answer after ${duration(e.ms)}`, tone: (e.ms ?? 0) > 15000 ? "bad" : "quiet" };
    case "chat_done":
      return { text: `Answer finished after ${duration(e.ms)}${p.status && p.status !== "done" ? ` (${p.status})` : ""}`, tone: "quiet" };
    case "chat_stopped":
      return { text: `Stopped the answer after ${duration(e.ms)}`, tone: "bad" };
    case "chat_failed":
      return { text: `The answer failed: ${p.reason ?? "unknown"}`, tone: "bad" };
    case "chat_retry":
      return { text: "Tried the answer again", tone: "plain" };
    case "easy_read_opened":
      return { text: "Opened Easy Read", tone: "plain" };
    case "limit_hit":
      return { text: `Hit the ${String(p.which ?? "plan").replace("_", " ")} limit`, tone: "bad" };
    case "upgrade_shown":
      return { text: `Saw an upgrade prompt${p.prompt ? `: “${p.prompt}”` : ""}`, tone: "plain" };
    case "checkout_started":
      return { text: `Started paying${p.method ? ` by ${p.method}` : ""}`, tone: "good" };
    case "checkout_result":
      return { text: p.status === "active" ? "Payment confirmed" : "Payment not confirmed", tone: p.status === "active" ? "good" : "bad" };
    case "api_error":
      return { text: `Saw an error (${p.endpoint}, ${p.status})`, tone: "bad" };
    case "js_error":
      return { text: `The page hit an error: ${p.message ?? ""}`, tone: "bad" };
    case "email_clicked":
      return { text: `Clicked “${p.label ?? "the button"}” in a follow-up email`, tone: "good" };
    default:
      return { text: e.name.replace(/_/g, " "), tone: "plain" };
  }
};
