import React, { FC, KeyboardEvent, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Cookies from "js-cookie";
import cn from "classnames";
import { ArrowUp, Check, ExternalLink, Mail, MailCheck, Maximize2, MessageCircleQuestion, Send, Square, SquarePen, X } from "lucide-react";
import { API_BASE_URL, accessToken } from "@/constants";
import { useFollowUpActionMutation } from "@/api-services/admin.service";
import { AskCard, AskEvent, FollowUp } from "@/models/insights.model";
import Spinner from "@/@shared/components/Spinner";
import { buttonClass } from "../ui";
import { EmailPreview } from "./FollowUpsView";

/* ---------- State shared by the panel and the full page ---------- */

export interface Turn {
  question: string;
  answer: string;
  steps: { label: string; done: boolean }[];
  cards: AskCard[];
  status: "thinking" | "writing" | "done" | "error";
  error?: string;
}

const STORE = "aix-admin-assistant-v1";
const load = (): Turn[] => {
  try {
    const raw = localStorage.getItem(STORE);
    const turns = raw ? (JSON.parse(raw) as Turn[]) : [];
    // A reply cut off by a reload is shown as it was left.
    return turns.map((t) => ({ ...t, cards: t.cards ?? [], status: t.status === "error" ? "error" : "done" }));
  } catch {
    return [];
  }
};
const save = (turns: Turn[]) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(turns.slice(-20)));
  } catch {
    // Private mode or full storage: the chat just won't survive a reload.
  }
};

export const BRIEF_ME =
  "What needs my attention today? Check the follow-ups waiting, frustrated students this week, new product ideas and anything unusual in the numbers, then tell me what to do first.";

const SUGGESTIONS = [
  "Who should I follow up with this week? Draft the emails.",
  "Why do students sign up and never come back?",
  "What frustrates students in chat this month?",
  "Which product idea should we build first, and why?",
];

interface AskApi {
  open: (question?: string) => void;
  close: () => void;
  turns: Turn[];
  busy: boolean;
  ask: (question: string) => void;
  stop: () => void;
  clear: () => void;
  updateCard: (turn: number, card: number, followUp: FollowUp) => void;
}
const AskContext = createContext<AskApi>({
  open: () => undefined,
  close: () => undefined,
  turns: [],
  busy: false,
  ask: () => undefined,
  stop: () => undefined,
  clear: () => undefined,
  updateCard: () => undefined,
});
export const useAsk = () => useContext(AskContext);

/** Reads the server-sent events from POST /admin/ask. */
async function streamAsk(
  question: string,
  history: { role: "user" | "assistant"; text: string }[],
  onEvent: (e: AskEvent) => void,
  signal: AbortSignal
) {
  const token = Cookies.get(accessToken);
  const res = await fetch(`${API_BASE_URL}/admin/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ question, history }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(res.status === 403 ? "Only admins can ask." : "Claude couldn’t be reached.");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        onEvent(JSON.parse(line.slice(6)) as AskEvent);
      } catch {
        // A malformed event: skip it.
      }
    }
  }
}

/* ---------- An email the assistant drafted, with its buttons ---------- */

const EmailCard: FC<{ card: AskCard; onChange: (f: FollowUp) => void }> = ({ card, onChange }) => {
  const f = card.followUp;
  const [act] = useFollowUpActionMutation();
  const [view, setView] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState<"send" | "test" | null>(null);
  const [note, setNote] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const first = (f.evidence?.firstName as string) || f.student.name.split(" ")[0];
  const blocked = !!card.unsubscribed;
  const canSend = (f.status === "suggested" || f.status === "snoozed") && !blocked;

  const run = async (action: "send" | "test") => {
    setBusy(action);
    setNote(null);
    try {
      const res = await act({ id: f.id, action }).unwrap();
      if (action === "test") setNote({ tone: "ok", text: `Test sent to ${(res as { sentTo: string }).sentTo}` });
      else {
        onChange({ ...f, status: "sent", sentOn: new Date().toISOString() });
        setNote({ tone: "ok", text: `Sent to ${f.student.email}` });
      }
    } catch (e) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      setNote({ tone: "bad", text: typeof msg === "string" ? msg : "That didn’t work. Try again." });
    } finally {
      setBusy(null);
      setConfirm(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-start gap-3 border-b border-line px-4 py-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-hover text-body">
          <Mail size={15} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-[13.5px] font-semibold text-ink">Email to {f.student.name}</p>
          <p className="truncate text-[12px] text-muted">
            {f.student.email} ·{" "}
            {f.status === "sent" ? "Sent" : f.status === "failed" ? "Draft failed" : f.status === "drafting" ? "Drafting" : "Draft, waiting for you"}
          </p>
        </div>
        <Link
          href={`/admin/follow-ups?id=${f.id}`}
          title="Edit in Follow-ups"
          aria-label="Edit in Follow-ups"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
        >
          <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </div>
      {f.subject ? (
        <button type="button" onClick={() => setView((v) => !v)} className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-canvas">
          <span className="text-[13.5px] font-semibold text-ink">{f.subject}</span>
          {!view && <span className="line-clamp-2 text-[13px] leading-snug text-subtle">{(f.body ?? "").replace(/\s+/g, " ")}</span>}
        </button>
      ) : (
        <p className="px-4 py-3 text-[13px] text-subtle">{f.error ?? "Claude couldn’t draft this one."}</p>
      )}
      {view && f.subject && (
        <div className="border-t border-line bg-well p-3">
          <EmailPreview headline={f.headline ?? ""} body={f.body ?? ""} button={f.buttonLabel ?? ""} firstName={first} />
        </div>
      )}
      {blocked && <p className="border-t border-line px-4 py-2.5 text-[12.5px] text-danger-strong">They’ve unsubscribed or their address bounced, so this can’t be sent.</p>}
      {note && (
        <p className={cn("flex items-center gap-1.5 border-t border-line px-4 py-2.5 text-[12.5px] font-semibold", note.tone === "ok" ? "text-success-strong" : "text-danger-strong")}>
          {note.tone === "ok" && <Check size={13} strokeWidth={2.6} aria-hidden="true" />}
          {note.text}
        </p>
      )}
      {f.subject && f.status !== "sent" && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-3 py-2.5">
          {confirm ? (
            <>
              <span className="mr-auto px-1 text-[13px] text-ink">
                Send to <b className="font-semibold">{first}</b> now?
              </span>
              <button type="button" onClick={() => setConfirm(false)} className="h-8 rounded-lg px-2.5 text-[12.5px] font-semibold text-subtle hover:bg-hover hover:text-ink">
                Cancel
              </button>
              <button type="button" onClick={() => run("send")} disabled={!!busy} className={cn(buttonClass.primary, "h-8 px-3 text-[12.5px]")}>
                {busy === "send" ? <Spinner size="xs" tone="current" /> : <Send size={13} aria-hidden="true" />}
                Yes, send
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setView((v) => !v)} className="h-8 rounded-lg px-2.5 text-[12.5px] font-semibold text-body hover:bg-hover hover:text-ink">
                {view ? "Hide email" : "View email"}
              </button>
              <button
                type="button"
                onClick={() => run("test")}
                disabled={!!busy}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-body hover:bg-hover hover:text-ink disabled:opacity-50"
              >
                {busy === "test" ? <Spinner size="xs" /> : <MailCheck size={13} aria-hidden="true" />}
                Send me a test
              </button>
              <button
                type="button"
                onClick={() => setConfirm(true)}
                disabled={!canSend || !!busy}
                className={cn(buttonClass.primary, "ml-auto h-8 px-3 text-[12.5px]")}
              >
                <Send size={13} aria-hidden="true" />
                Send
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------- The conversation (panel and full page) ---------- */

/** Links in answers: admin pages open in place, anything else in a new tab. */
const AnswerLink = ({ href, children }: { href?: string; children?: React.ReactNode }) =>
  href?.startsWith("/admin") ? (
    <Link href={href} className="font-semibold text-accent underline-offset-2 hover:underline">
      {children}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-accent">
      {children}
    </a>
  );

const Dot = () => <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--viz-primary)] motion-reduce:animate-none" />;

export const AssistantConversation: FC<{ wide?: boolean }> = ({ wide = false }) => {
  const { turns, busy, ask, stop, updateCard } = useAsk();
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);
  useEffect(() => input.current?.focus(), []);

  const submit = () => {
    if (!text.trim() || busy) return;
    ask(text);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <>
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className={cn("flex flex-col gap-6 px-5 py-5", wide && "mx-auto w-full max-w-[760px] py-8")}>
          {turns.length === 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-semibold text-ink">What would you like to know?</p>
                <p className="text-[13.5px] leading-relaxed text-subtle">
                  Claude can look through every student, chat, test, upload and follow-up, suggest what to do, and draft emails for you to send.
                </p>
              </div>
              <button
                type="button"
                onClick={() => ask(BRIEF_ME)}
                className="flex items-center gap-3 rounded-xl border border-ink bg-ink px-4 py-3 text-left text-surface transition-opacity hover:opacity-90"
              >
                <span className="flex flex-col">
                  <span className="text-[14px] font-semibold">Brief me on today</span>
                  <span className="text-[12.5px] opacity-75">What needs attention and what to do first</span>
                </span>
                <ArrowUp size={16} aria-hidden="true" className="ml-auto rotate-45" />
              </button>
              <ul className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => ask(s)}
                      className="w-full rounded-xl border border-line px-4 py-2.5 text-left text-[13.5px] text-ink transition-colors hover:border-control hover:bg-canvas"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {turns.map((t, i) => (
            <div key={i} className="flex flex-col gap-3">
              <p className="max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-tr-md bg-hover px-4 py-2.5 text-[14px] text-ink">{t.question}</p>
              {t.steps.length > 0 && (
                <ul aria-label="What Claude looked at" className="flex flex-col gap-1">
                  {t.steps.map((s, j) => (
                    <li key={j} className="flex items-center gap-2 text-[12.5px] text-subtle">
                      {s.done ? <Check size={13} strokeWidth={2.6} className="text-success" aria-hidden="true" /> : <Dot />}
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
              {t.status === "thinking" && t.steps.length === 0 && (
                <p className="flex items-center gap-2 text-[12.5px] text-subtle">
                  <Dot />
                  Thinking
                </p>
              )}
              {t.cards.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  {t.cards.map((c, j) => (
                    <EmailCard key={`${i}-${j}-${c.followUp.id}`} card={c} onChange={(f) => updateCard(i, j, f)} />
                  ))}
                </div>
              )}
              {t.answer && (
                <div aria-live="polite" className="prose prose-sm max-w-none text-[14px] leading-relaxed text-body dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:mb-1 prose-headings:mt-3 prose-headings:text-[14.5px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: AnswerLink }}>
                    {t.answer}
                  </ReactMarkdown>
                  {t.status === "writing" && <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-[var(--viz-primary)] align-middle motion-reduce:animate-none" />}
                </div>
              )}
              {t.status === "error" && <p className="rounded-xl bg-danger-bg px-4 py-2.5 text-[13px] text-danger-strong">{t.error}</p>}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn("border-t border-line p-3 pb-[max(12px,env(safe-area-inset-bottom))]", wide && "border-t-0 pb-6")}
      >
        <div className={cn("flex items-end gap-2 rounded-2xl border border-control bg-surface p-2 transition-colors focus-within:border-ink", wide && "mx-auto max-w-[760px] shadow-xs")}>
          <label htmlFor={wide ? "assistant-input-page" : "assistant-input"} className="sr-only">
            Your message
          </label>
          <textarea
            id={wide ? "assistant-input-page" : "assistant-input"}
            ref={input}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask, or tell Claude what to do…"
            className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[16px] text-ink placeholder:text-faint focus:outline-none md:text-[14px]"
          />
          {busy ? (
            <button type="button" onClick={stop} aria-label="Stop" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-hover text-ink">
              <Square size={14} fill="currentColor" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" disabled={!text.trim()} aria-label="Send" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-surface transition-opacity disabled:opacity-25">
              <ArrowUp size={17} strokeWidth={2.4} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className={cn("px-2 pt-1.5 text-[11.5px] text-muted", wide && "mx-auto max-w-[760px]")}>
          Claude reads your data and drafts emails. Nothing is sent until you press Send.
        </p>
      </form>
    </>
  );
};

const Header: FC<{ onClose?: () => void; expand?: boolean }> = ({ onClose, expand }) => {
  const { turns, clear, busy } = useAsk();
  return (
    <header className="flex items-center gap-2 border-b border-line px-4 py-3.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-surface">
        <MessageCircleQuestion size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="mr-auto flex flex-col">
        <h2 className="text-[15px] font-bold text-ink">Ask Claude</h2>
        <p className="text-[12px] text-subtle">Your assistant for students, follow-ups and ideas</p>
      </div>
      {turns.length > 0 && (
        <button type="button" onClick={clear} disabled={busy} title="New chat" aria-label="New chat" className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink disabled:opacity-40">
          <SquarePen size={16} aria-hidden="true" />
        </button>
      )}
      {expand && (
        <Link href="/admin/assistant" onClick={onClose} title="Open full page" aria-label="Open full page" className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink">
          <Maximize2 size={15} aria-hidden="true" />
        </Link>
      )}
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink">
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </header>
  );
};

/** The assistant on its own page. */
export const AssistantPage: FC = () => (
  <div className="-mx-4 -mb-12 -mt-5 flex h-[calc(100dvh-56px)] flex-col bg-surface md:-mx-9 md:-mb-10 md:-mt-7 md:h-[100dvh]">
    <Header />
    <AssistantConversation wide />
  </div>
);

/** Wraps the admin: holds the chat, provides `useAsk()`, and Ctrl/⌘ + K. */
export const AskProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;

  useEffect(() => setTurns(load()), []);
  useEffect(() => {
    if (!busy) save(turns);
  }, [turns, busy]);
  useEffect(() => () => abort.current?.abort(), []);

  const update = (fn: (t: Turn) => Turn) => setTurns((all) => (all.length ? [...all.slice(0, -1), fn(all[all.length - 1])] : all));

  const ask = useCallback(async (question: string) => {
    const q = question.trim();
    if (!q || abort.current) return;
    const history = turnsRef.current.slice(-4).flatMap((t) => [
      { role: "user" as const, text: t.question },
      ...(t.answer ? [{ role: "assistant" as const, text: t.answer }] : []),
    ]);
    setTurns((all) => [...all, { question: q, answer: "", steps: [], cards: [], status: "thinking" }]);
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      await streamAsk(
        q,
        history,
        (e) => {
          if (e.type === "step") update((t) => ({ ...t, steps: [...t.steps.map((s) => ({ ...s, done: true })), { label: e.label, done: false }] }));
          if (e.type === "card") update((t) => ({ ...t, cards: [...t.cards, e.card] }));
          if (e.type === "text") update((t) => ({ ...t, status: "writing", answer: t.answer + e.text, steps: t.steps.map((s) => ({ ...s, done: true })) }));
          if (e.type === "done") update((t) => ({ ...t, status: "done", steps: t.steps.map((s) => ({ ...s, done: true })) }));
          if (e.type === "error") update((t) => ({ ...t, status: "error", error: e.message }));
        },
        controller.signal
      );
      update((t) => (t.status === "done" || t.status === "error" ? t : { ...t, status: "done" }));
    } catch (error) {
      if (!controller.signal.aborted) update((t) => ({ ...t, status: "error", error: (error as Error)?.message || "Something went wrong." }));
      else update((t) => ({ ...t, status: "done", steps: t.steps.map((s) => ({ ...s, done: true })) }));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const api: AskApi = {
    open: (question) => {
      setOpen(true);
      if (question) void ask(question);
    },
    close: () => setOpen(false),
    turns,
    busy,
    ask: (q) => void ask(q),
    stop: () => abort.current?.abort(),
    clear: () => {
      setTurns([]);
      save([]);
    },
    updateCard: (ti, ci, followUp) =>
      setTurns((all) => all.map((t, i) => (i !== ti ? t : { ...t, cards: t.cards.map((c, j) => (j !== ci ? c : { ...c, followUp })) }))),
  };

  return (
    <AskContext.Provider value={api}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label="Ask Claude">
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/25" />
          <div className="relative flex h-full w-full max-w-[520px] flex-col border-l border-line bg-surface shadow-pop">
            <Header onClose={() => setOpen(false)} expand />
            <AssistantConversation />
          </div>
        </div>
      )}
    </AskContext.Provider>
  );
};

/** The button in the sidebar and top bar. */
export const AskButton: FC<{ className?: string; compact?: boolean }> = ({ className, compact }) => {
  const { open } = useAsk();
  return (
    <button
      type="button"
      onClick={() => open()}
      aria-label={compact ? "Ask Claude" : undefined}
      className={cn(
        "group flex h-10 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-2.5 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-control",
        className
      )}
    >
      <MessageCircleQuestion size={17} strokeWidth={1.9} aria-hidden="true" className="text-accent" />
      {!compact && <span className="mr-auto">Ask Claude</span>}
      {!compact && <kbd className="rounded-[6px] border border-line px-1.5 font-mono text-[10.5px] font-medium text-muted">⌘K</kbd>}
    </button>
  );
};
