import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Clock, MailCheck, PenLine, RefreshCw, Send, SlidersHorizontal, Undo2, X } from "lucide-react";
import {
  useEditFollowUpMutation,
  useFollowUpActionMutation,
  useGetFollowUpsQuery,
  useRunFollowUpsMutation,
  useUpdateFollowUpRuleMutation,
} from "@/api-services/admin.service";
import { FollowUp, FollowUpRule } from "@/models/insights.model";
import Spinner from "@/@shared/components/Spinner";
import AdminDialog from "../AdminDialog";
import { formatDayAndTime, formatNumber, relativeTime, sentenceCase } from "../format";
import { useUrlState } from "../useUrlState";
import { SelectMenu, Segmented } from "../kit/Menus";
import { useNarrow } from "../kit/Popover";
import { Avatar, EmptyState, ErrorState, LoadingBlock, PageHeader, buttonClass, inputClass } from "../ui";
import { pct } from "../charts/Panels";
import { Quote } from "./insightsUi";

const TABS = [
  { key: "suggested", label: "To review" },
  { key: "sent", label: "Sent" },
  { key: "snoozed", label: "Snoozed" },
  { key: "dismissed", label: "Dismissed" },
] as const;
type TabKey = (typeof TABS)[number]["key"] | "rules";

/** One colour per rule, from the chart palette, so a rule reads the same everywhere. */
const RULE_COLOR: Record<string, string> = {
  frustrated: "var(--mood-frustrated)",
  test_abandoned: "var(--viz-5)",
  struggling_topic: "var(--viz-4)",
  gone_quiet: "var(--viz-2)",
  stuck_start: "var(--viz-1)",
  easy_read_limit: "var(--viz-6)",
  power_user: "var(--viz-7)",
  manual: "var(--viz-primary)",
};

const apiMessage = (e: unknown, fallback: string) => {
  const d = (e as { data?: { message?: unknown } })?.data;
  return typeof d?.message === "string" ? d.message : fallback;
};

/** "2026-11-21" → "21 Nov 2026"; anything else as it is. */
const day = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${v}T12:00:00Z`))
    : String(v ?? "");

const shortUrl = (u: string | null) => (u ? u.replace(/^https?:\/\//, "") : "");

const RuleTag: FC<{ rule: string; title: string; className?: string }> = ({ rule, title, className }) => (
  <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] font-medium text-subtle", className)}>
    <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: RULE_COLOR[rule] ?? "var(--viz-prev)" }} />
    {title}
  </span>
);

/** The facts behind a suggestion, as a plain list of labels and values. */
const Facts: FC<{ f: FollowUp }> = ({ f }) => {
  const e = f.evidence;
  const rows: [string, ReactNode][] = [];
  if (e.signedUpOn) rows.push(["Signed up", day(e.signedUpOn)]);
  if (e.lastActiveOn) rows.push(["Last active", day(e.lastActiveOn)]);
  if (e.plan) rows.push(["Plan", sentenceCase(String(e.plan))]);
  if (typeof e.documentsUploaded === "number") rows.push(["Uploads", formatNumber(e.documentsUploaded)]);
  if (typeof e.testsMade === "number") rows.push(["Tests", `${formatNumber(e.testsMade)} made, ${formatNumber(e.testsFinished ?? 0)} finished`]);
  if (e.test?.answered) rows.push(["Stopped at", `Question ${e.test.answered} of ${e.test.questions} (${e.test.type})`]);
  if (e.document?.title) rows.push(["Document", e.document.title]);
  if (e.lowScores) rows.push(["Low scores", `${e.lowScores} tests, ${e.averageOfThoseScores}% on average`]);
  if (e.topicsMissed?.length) rows.push(["Missed topics", e.topicsMissed.join(", ")]);
  if (e.freeMinutesUsed) rows.push(["Easy Read", `${e.freeMinutesUsed} free minutes used`]);
  if (e.actionsThisMonth) rows.push(["This month", `${formatNumber(e.actionsThisMonth)} actions`]);
  if (!rows.length) return null;
  return (
    <dl className="grid max-w-[760px] grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={k} className={cn("flex min-w-0 flex-col gap-0.5", (k === "Document" || k === "Missed topics") && "col-span-2 sm:col-span-3")}>
          <dt className="text-[12px] text-muted">{k}</dt>
          <dd className="break-words text-[14px] font-medium text-ink tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
};

/** The email as the student will see it (a close match of the plain letter template). */
export const EmailPreview: FC<{ headline: string; body: string; button: string; firstName: string | null }> = ({ headline, body, button, firstName }) => (
  <div className="overflow-hidden rounded-xl bg-white text-[#1a1a1a] shadow-[0_1px_2px_rgba(16,12,40,0.06),0_8px_24px_-12px_rgba(16,12,40,0.18)]">
    <div className="flex flex-col gap-3.5 px-6 py-6 md:px-8 md:py-7">
      <p className="text-[11px] font-bold tracking-[0.04em] text-[#5b21b6]">AI EXAMINER</p>
      <p className="text-[21px] font-extrabold leading-tight tracking-[-0.01em]">{headline || "Headline"}</p>
      {(body || "")
        .replace(/\{first name\}/gi, firstName || "there")
        .split(/\n{2,}/)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-wrap text-[15px] leading-[1.65] text-[#33333b]">
            {p}
          </p>
        ))}
      <span className="mt-1 inline-flex w-fit rounded-[10px] bg-[#2f004f] px-5 py-3 text-[14px] font-bold text-white">{button || "Open AI Examiner"}</span>
      <p className="text-[14px] leading-relaxed text-[#33333b]">
        Happy studying,
        <br />
        The AI Examiner team
      </p>
    </div>
    <p className="border-t border-[#ececef] bg-[#fafafa] px-6 py-3 text-[11.5px] text-[#6b6b74] md:px-8">Unsubscribe or change your email settings</p>
  </div>
);

/** Like an email client: who it goes to and the subject, above the letter itself. */
const MailFrame: FC<{ to: string; subject: string; children: ReactNode }> = ({ to, subject, children }) => (
  <div className="overflow-hidden rounded-xl border border-line">
    <dl className="grid grid-cols-[72px_minmax(0,1fr)] gap-y-1.5 border-b border-line bg-surface px-4 py-3 text-[13.5px]">
      <dt className="text-muted">To</dt>
      <dd className="truncate text-body">{to}</dd>
      <dt className="text-muted">Subject</dt>
      <dd className="font-semibold text-ink">{subject || <span className="font-normal text-faint">No subject yet</span>}</dd>
    </dl>
    <div className="bg-well px-3 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-[600px]">{children}</div>
    </div>
  </div>
);

const Field: FC<{ label: string; hint?: ReactNode; children: ReactNode; htmlFor: string }> = ({ label, hint, children, htmlFor }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
      {label}
    </label>
    {children}
    {hint && <p className="text-[12px] text-muted">{hint}</p>}
  </div>
);

const REWRITES = ["Shorter", "Warmer", "More direct", "Less salesy"];

const Detail: FC<{
  f: FollowUp;
  position: { index: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
  onDone: () => void;
  onBack?: () => void;
}> = ({ f, position, onPrev, onNext, onDone, onBack }) => {
  const [subject, setSubject] = useState(f.subject ?? "");
  const [headline, setHeadline] = useState(f.headline ?? "");
  const [body, setBody] = useState(f.body ?? "");
  const [button, setButton] = useState(f.buttonLabel ?? "");
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [confirming, setConfirming] = useState(false);
  const [instruction, setInstruction] = useState("");
  /** The email before Claude's last rewrite, so it can be put back. */
  const [previous, setPrevious] = useState<{ subject: string; headline: string; body: string; button: string } | null>(null);
  const [edit, editState] = useEditFollowUpMutation();
  const [act] = useFollowUpActionMutation();
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setSubject(f.subject ?? "");
    setHeadline(f.headline ?? "");
    setBody(f.body ?? "");
    setButton(f.buttonLabel ?? "");
    setConfirming(false);
  }, [f.id, f.subject, f.headline, f.body, f.buttonLabel]);

  const dirty = subject !== (f.subject ?? "") || headline !== (f.headline ?? "") || body !== (f.body ?? "") || button !== (f.buttonLabel ?? "");
  const editable = f.status === "suggested" || f.status === "snoozed" || f.status === "failed";
  const firstName = (f.evidence.firstName as string) ?? null;
  const who = firstName ?? f.student.name.split(" ")[0];

  const save = async () => {
    if (!dirty) return true;
    try {
      await edit({ id: f.id, subject, headline, body, buttonLabel: button }).unwrap();
      return true;
    } catch (e) {
      toast.error(apiMessage(e, "Couldn’t save your changes"));
      return false;
    }
  };

  const undoRewrite = () => {
    if (!previous) return;
    setSubject(previous.subject);
    setHeadline(previous.headline);
    setBody(previous.body);
    setButton(previous.button);
    setPrevious(null);
  };

  const discard = () => {
    setSubject(f.subject ?? "");
    setHeadline(f.headline ?? "");
    setBody(f.body ?? "");
    setButton(f.buttonLabel ?? "");
  };

  const run = async (action: "send" | "test" | "snooze" | "dismiss" | "restore" | "redraft", extra: Record<string, unknown> = {}) => {
    setBusy(action);
    try {
      // Rewrites start from what's on screen, so save any edits first.
      if ((action === "send" || action === "test" || action === "redraft") && !(await save())) return;
      const before = { subject, headline, body, button };
      const res = await act({ id: f.id, action, ...extra }).unwrap();
      if (action === "send") toast.success(`Sent to ${f.student.name}`);
      if (action === "test") toast.success(`Test sent to ${(res as { sentTo: string }).sentTo}`);
      if (action === "snooze") toast.success(`Snoozed. ${who} comes back to this list in 3 days.`);
      if (action === "redraft") {
        const r = res as FollowUp;
        setSubject(r.subject ?? "");
        setHeadline(r.headline ?? "");
        setBody(r.body ?? "");
        setButton(r.buttonLabel ?? "");
        setInstruction("");
        setPrevious(before);
        toast.success("Claude rewrote the email");
      }
      if (["send", "snooze", "dismiss", "restore"].includes(action)) onDone();
    } catch (e) {
      toast.error(apiMessage(e, "That didn’t work. Try again."));
    } finally {
      setBusy(null);
      setConfirming(false);
    }
  };

  const rewriting = busy === "redraft";
  const bodyRows = Math.max(9, body.split("\n").length + 2);

  return (
    <article aria-label={`Follow-up for ${f.student.name}`} className="flex min-w-0 flex-col rounded-2xl border border-line bg-surface">
      {/* Who it's for, and moving through the queue. */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line px-5 py-4 md:px-6">
        {onBack && (
          <button type="button" onClick={onBack} className="-ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg px-1.5 text-[13px] font-semibold text-subtle hover:bg-hover hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            All follow-ups
          </button>
        )}
        <div className={cn("flex min-w-0 items-center gap-3", onBack ? "w-full" : "mr-auto")}>
          <Avatar initials={f.student.initials} seed={f.student.id} size={40} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link href={`/admin/users/${f.student.id}`} className="truncate text-[17px] font-bold leading-tight text-ink hover:text-accent">
              {f.student.name}
            </Link>
            <p className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[13px] text-subtle">
              <span className="truncate">{f.student.email}</span>
              <RuleTag rule={f.rule} title={f.ruleTitle} />
            </p>
          </div>
        </div>
        {position.total > 1 && (
          <div className="flex items-center gap-1" aria-label="Move through the list">
            <span className="mr-1.5 font-mono text-[12px] text-muted tabular-nums">
              {position.index + 1} of {position.total}
            </span>
            <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous (K)" title="Previous (K)" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-body transition-colors hover:border-control hover:text-ink disabled:opacity-35">
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next (J)" title="Next (J)" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-body transition-colors hover:border-control hover:text-ink disabled:opacity-35">
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      {/* Why Claude picked them. */}
      <section aria-labelledby={`why-${f.id}`} className="flex flex-col gap-4 px-5 py-5 md:px-6 md:py-6">
        <h3 id={`why-${f.id}`} className="text-[14px] font-semibold text-ink">
          Why Claude suggested {who}
        </h3>
        {f.reason && <p className="max-w-[68ch] text-[15px] leading-relaxed text-body">{f.reason}</p>}
        <Facts f={f} />
        {f.evidence.whatHappened && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] text-muted">What happened{f.evidence.where ? ` in ${String(f.evidence.where).replace(/_/g, " ")}` : ""}</p>
            <Quote>{f.evidence.whatHappened}</Quote>
          </div>
        )}
      </section>

      {/* The email. */}
      <section aria-labelledby={`mail-${f.id}`} className="flex flex-col gap-4 border-t border-line px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 id={`mail-${f.id}`} className="mr-auto text-[14px] font-semibold text-ink">
            {f.status === "sent" ? "The email they got" : `The email ${who} will get`}
          </h3>
          {dirty && editable && (
            <span className="flex items-center gap-2 text-[12.5px] text-subtle">
              Unsaved changes
              <button type="button" onClick={discard} className="font-semibold text-subtle hover:text-ink">
                Discard
              </button>
              <button type="button" onClick={() => save()} disabled={editState.isLoading} className="font-semibold text-accent hover:text-accent-900">
                {editState.isLoading ? "Saving…" : "Save"}
              </button>
            </span>
          )}
          {editable && f.status !== "drafting" && (
            <Segmented
              label="Email view"
              value={mode}
              size="md"
              options={[
                { value: "preview", label: "Preview" },
                { value: "edit", label: "Edit" },
              ]}
              onChange={setMode}
            />
          )}
        </div>

        {f.status === "drafting" ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-line px-4 py-10 text-[13.5px] text-subtle">
            <Spinner size="sm" />
            Claude is drafting this email…
          </div>
        ) : (
          <div className={cn("relative transition-opacity", rewriting && "pointer-events-none opacity-50")} aria-busy={rewriting || undefined}>
            {mode === "preview" || !editable ? (
              <MailFrame to={`${f.student.name} <${f.student.email ?? ""}>`} subject={subject}>
                <EmailPreview headline={headline} body={body} button={button} firstName={firstName} />
              </MailFrame>
            ) : (
              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="flex max-w-[640px] flex-col gap-4">
                  <Field label="Subject" htmlFor={`subject-${f.id}`}>
                    <input id={`subject-${f.id}`} value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Headline" hint="The large line at the top of the email." htmlFor={`headline-${f.id}`}>
                    <input id={`headline-${f.id}`} value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Message" hint="Leave a blank line between paragraphs. “Happy studying” is added for you." htmlFor={`body-${f.id}`}>
                    <textarea
                      id={`body-${f.id}`}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={bodyRows}
                      className={cn(inputClass, "h-auto resize-y py-3 leading-relaxed")}
                    />
                  </Field>
                  <Field
                    label="Button"
                    hint={
                      f.buttonUrl ? (
                        <>
                          Opens <span className="font-mono text-[11.5px] text-body">{shortUrl(f.buttonUrl)}</span>
                        </>
                      ) : undefined
                    }
                    htmlFor={`button-${f.id}`}
                  >
                    <input id={`button-${f.id}`} value={button} onChange={(e) => setButton(e.target.value)} className={inputClass} />
                  </Field>
                </div>
                <div className="hidden 2xl:block">
                  <div className="sticky top-6 flex flex-col gap-2">
                    <p className="text-[12px] text-muted">Live preview</p>
                    <EmailPreview headline={headline} body={body} button={button} firstName={firstName} />
                  </div>
                </div>
              </div>
            )}
            {rewriting && (
              <p role="status" className="absolute inset-x-0 top-24 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-surface shadow-pop">
                Claude is rewriting the email…
              </p>
            )}
          </div>
        )}

        {editable && f.status !== "drafting" && (
          <div className="flex flex-col gap-2">
            {/* One prompt box, like Gmail's "Help me write": say the change, press enter. */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (instruction.trim()) run("redraft", { instruction: instruction.trim() });
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border border-control bg-surface py-1.5 pl-3.5 pr-1.5 transition-colors focus-within:border-ink",
                rewriting && "opacity-60"
              )}
            >
              <PenLine size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-subtle" />
              <label htmlFor={`rewrite-${f.id}`} className="sr-only">
                Ask Claude to change the email
              </label>
              <input
                id={`rewrite-${f.id}`}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={!!busy}
                placeholder={`Ask Claude to change the email, e.g. “mention their last score”`}
                className="h-9 min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-faint focus:outline-none md:text-[14px]"
              />
              <button
                type="submit"
                disabled={!instruction.trim() || !!busy}
                aria-label="Rewrite"
                title="Rewrite"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-surface transition-opacity disabled:opacity-25"
              >
                {rewriting ? <Spinner size="xs" tone="current" /> : <ArrowUp size={17} strokeWidth={2.4} aria-hidden="true" />}
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-1.5">
              {REWRITES.map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={!!busy}
                  onClick={() => run("redraft", { instruction: r })}
                  className="h-7 rounded-full border border-line px-2.5 text-[12.5px] font-medium text-subtle transition-colors hover:border-control hover:text-ink disabled:opacity-50"
                >
                  {r}
                </button>
              ))}
              {previous && !busy && (
                <button
                  type="button"
                  onClick={undoRewrite}
                  className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[12.5px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink"
                >
                  <Undo2 size={13} aria-hidden="true" />
                  Undo Claude’s rewrite
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* The decision, always in reach. */}
      {f.status === "sent" ? (
        <footer className="flex flex-wrap items-center gap-2 rounded-b-2xl border-t border-line px-5 py-4 text-[13.5px] text-body md:px-6">
          <MailCheck size={17} className="text-success" aria-hidden="true" />
          Sent {formatDayAndTime(f.sentOn!)} {f.auto ? "automatically" : f.sentBy ? `by ${f.sentBy}` : ""}.
          {f.clickedOn ? (
            <b className="font-semibold text-success-strong">Clicked the button {relativeTime(f.clickedOn).toLowerCase()}.</b>
          ) : (
            <span className="text-muted">Hasn’t clicked the button.</span>
          )}
          {f.returnedOn ? (
            <b className="font-semibold text-success-strong">Came back {relativeTime(f.returnedOn).toLowerCase()}.</b>
          ) : (
            <span className="text-muted">Hasn’t come back yet.</span>
          )}
        </footer>
      ) : f.status === "dismissed" || f.status === "drafting" ? null : (
        <footer className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 rounded-b-2xl border-t border-line bg-surface px-5 py-3.5 md:px-6">
          {f.error && <p className="w-full pb-1 text-[13px] text-danger">{f.error}</p>}
          {f.status === "snoozed" ? (
            <>
              <span className="mr-auto text-[13.5px] text-subtle">{f.snoozedUntil ? `Snoozed until ${formatDayAndTime(f.snoozedUntil)}` : "Snoozed"}</span>
              <button type="button" onClick={() => run("restore")} disabled={!!busy} className={buttonClass.secondary}>
                <Undo2 size={15} aria-hidden="true" />
                Back to review
              </button>
            </>
          ) : confirming ? (
            <>
              <span className="mr-auto min-w-0 text-[14px] text-ink">
                Send to <b className="font-semibold">{f.student.email}</b> now?
              </span>
              <button type="button" onClick={() => setConfirming(false)} className={buttonClass.secondary}>
                Cancel
              </button>
              <button type="button" onClick={() => run("send")} disabled={!!busy} className={buttonClass.primary}>
                {busy === "send" ? <Spinner size="xs" tone="current" /> : <Send size={15} aria-hidden="true" />}
                Yes, send it
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setConfirming(true)} disabled={!!busy || !subject || !body} className={cn(buttonClass.primary, "max-sm:flex-1")}>
                <Send size={15} aria-hidden="true" />
                Send to {who}
              </button>
              <button type="button" onClick={() => run("test")} disabled={!!busy} className={buttonClass.secondary} aria-label="Send me a test">
                {busy === "test" ? <Spinner size="xs" tone="current" /> : <MailCheck size={15} aria-hidden="true" />}
                <span className="max-sm:hidden">Send me a test</span>
                <span className="sm:hidden">Test</span>
              </button>
              <span className="flex gap-1 max-sm:w-full max-sm:justify-end sm:ml-auto">
                <button
                  type="button"
                  onClick={() => run("snooze", { days: 3 })}
                  disabled={!!busy}
                  title="Bring it back in 3 days"
                  className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink disabled:opacity-50"
                >
                  <Clock size={15} aria-hidden="true" />
                  Snooze 3 days
                </button>
                <button
                  type="button"
                  onClick={() => run("dismiss")}
                  disabled={!!busy}
                  className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink disabled:opacity-50"
                >
                  <X size={15} aria-hidden="true" />
                  Dismiss
                </button>
              </span>
            </>
          )}
        </footer>
      )}
      {f.status === "dismissed" && (
        <footer className="flex flex-wrap items-center gap-2 rounded-b-2xl border-t border-line px-5 py-3.5 md:px-6">
          <span className="mr-auto text-[13.5px] text-subtle">Dismissed. Nothing was sent to {who}.</span>
          <button type="button" onClick={() => run("restore")} disabled={!!busy} className={buttonClass.secondary}>
            <Undo2 size={15} aria-hidden="true" />
            Back to review
          </button>
        </footer>
      )}
    </article>
  );
};

/* ---------- Rules ---------- */

const Toggle: FC<{ on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }> = ({ on, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!on)}
    className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-40", on ? "bg-ink" : "bg-control")}
  >
    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-xs transition-[left] duration-200", on ? "left-[18px]" : "left-0.5")} />
  </button>
);

const RulesView: FC<{ rules: FollowUpRule[] }> = ({ rules }) => {
  const [update, { isLoading }] = useUpdateFollowUpRuleMutation();
  const [confirmAuto, setConfirmAuto] = useState<FollowUpRule | null>(null);
  const set = async (rule: string, body: { enabled?: boolean; autoSend?: boolean }) => {
    try {
      await update({ rule, ...body }).unwrap();
    } catch {
      // Toast already shown.
    }
  };
  return (
    <section aria-labelledby="rules-h" className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-col gap-1 border-b border-line px-5 py-5 md:px-6">
        <h2 id="rules-h" className="text-[16px] font-bold text-ink">
          Rules
        </h2>
        <p className="max-w-[72ch] text-[13.5px] leading-relaxed text-subtle">
          Each morning at 05:00 (Lagos), Claude looks for students who match these rules and drafts an email for each. Every email waits for your review
          unless you let a rule send by itself. Nobody gets more than one follow-up a week.
        </p>
      </div>
      <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_96px_120px] gap-6 border-b border-line px-6 py-2.5 text-[12px] font-medium text-muted lg:grid">
        <span>Rule</span>
        <span>Results so far</span>
        <span>Suggest</span>
        <span>Send by itself</span>
      </div>
      <ul className="divide-y divide-line">
        {rules.map((r) => {
          const rate = r.sent ? pct(((r.returned ?? 0) / r.sent) * 100) : null;
          return (
            <li key={r.key} className="grid grid-cols-1 gap-3 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_96px_120px] lg:items-center lg:gap-6">
              <div className="flex min-w-0 flex-col gap-1">
                <RuleTag rule={r.key} title={r.title} className="text-[14.5px] font-semibold text-ink" />
                <p className="text-[13px] leading-snug text-body">{r.when}</p>
                <p className="text-[12.5px] leading-snug text-muted">Aim: {r.aim}</p>
              </div>
              <p className="text-[13px] text-body">
                {r.sent ? (
                  <>
                    <b className="font-semibold text-ink tabular-nums">{formatNumber(r.sent)}</b> sent ·{" "}
                    <b className="font-semibold text-ink tabular-nums">{formatNumber(r.clicked ?? 0)}</b> clicked ·{" "}
                    <b className="font-semibold text-ink tabular-nums">{formatNumber(r.returned ?? 0)}</b> came back within a week ({rate})
                  </>
                ) : (
                  <span className="text-muted">None sent yet</span>
                )}
              </p>
              <label className="flex items-center justify-between gap-3 text-[13px] font-medium text-body lg:justify-start">
                <span className="lg:sr-only">Suggest people for this rule</span>
                <Toggle label={`${r.title}: suggest people`} on={r.enabled} disabled={isLoading} onChange={(v) => set(r.key, { enabled: v })} />
              </label>
              <label className="flex items-center justify-between gap-3 text-[13px] font-medium text-body lg:justify-start">
                <span className="lg:sr-only">Send by itself, without review</span>
                <Toggle
                  label={`${r.title}: send by itself`}
                  on={r.autoSend}
                  disabled={isLoading || !r.enabled}
                  onChange={(v) => (v ? setConfirmAuto(r) : set(r.key, { autoSend: false }))}
                />
              </label>
            </li>
          );
        })}
      </ul>
      <AdminDialog
        open={!!confirmAuto}
        title={`Send “${confirmAuto?.title}” emails by themselves?`}
        onClose={() => setConfirmAuto(null)}
        actions={
          <>
            <button type="button" className={buttonClass.secondary} onClick={() => setConfirmAuto(null)}>
              Keep reviewing them
            </button>
            <button
              type="button"
              className={buttonClass.primary}
              onClick={async () => {
                if (confirmAuto) await set(confirmAuto.key, { autoSend: true });
                setConfirmAuto(null);
              }}
            >
              Send by themselves
            </button>
          </>
        }
      >
        <p>
          Claude’s drafts for this rule will go out without your review, within the daily email limit and never to anyone who unsubscribed. You’ll still see
          every one in Sent, and you can turn this off at any time.
        </p>
      </AdminDialog>
    </section>
  );
};

/* ---------- Page ---------- */

/** Follow-ups: Claude suggests who to email and drafts it; you review, edit and send. */
const FollowUpsView: FC = () => {
  const url = useUrlState();
  const narrow = useNarrow(1280);
  const tab: TabKey = url.get("tab") === "rules" ? "rules" : ((TABS.find((t) => t.key === url.get("tab"))?.key ?? "suggested") as TabKey);
  const listTab = tab === "rules" ? "suggested" : tab;
  const rule = url.get("rule") ?? "";
  const [poll, setPoll] = useState(0);
  const { data, isLoading, isFetching, isError, refetch } = useGetFollowUpsQuery(
    { status: listTab },
    { skip: !url.ready, pollingInterval: poll, refetchOnMountOrArgChange: true }
  );
  const [runNow, runState] = useRunFollowUpsMutation();
  const listRef = useRef<HTMLUListElement>(null);

  const drafting = !!data && (data.busy || data.counts.drafting > 0);
  useEffect(() => setPoll(drafting ? 4000 : 0), [drafting]);

  const all = useMemo(() => data?.items ?? [], [data]);
  const items = useMemo(() => (rule ? all.filter((f) => f.rule === rule) : all), [all, rule]);
  const ruleCounts = useMemo(() => all.reduce<Record<string, number>>((a, f) => ({ ...a, [f.rule]: (a[f.rule] ?? 0) + 1 }), {}), [all]);
  const ruleTitles = useMemo(() => all.reduce<Record<string, string>>((a, f) => ({ ...a, [f.rule]: f.ruleTitle }), {}), [all]);
  const urlId = url.get("id");
  // Wide screens always show one open; on phones the list comes first.
  const selected = items.find((f) => f.id === urlId) ?? (narrow ? undefined : items[0]);
  const index = selected ? items.findIndex((f) => f.id === selected.id) : -1;

  const open = useCallback((id: string | undefined) => url.set({ id }), [url]);
  const prev = index > 0 ? () => open(items[index - 1].id) : undefined;
  const next = index >= 0 && index < items.length - 1 ? () => open(items[index + 1].id) : undefined;

  // J and K move through the queue (not while typing).
  useEffect(() => {
    if (narrow || tab === "rules") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, [contenteditable], [role='dialog']")) return;
      if (e.key === "j" && next) next();
      if (e.key === "k" && prev) prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Keep the open row in view in the list.
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" });
  }, [selected?.id]);

  const find = async () => {
    try {
      const res = await runNow().unwrap();
      if (res.busy) toast.info("Claude is still drafting the last batch.");
      else if (!res.created) toast.info("Nobody new to follow up with right now.");
      else toast.success(`Found ${res.created} ${res.created === 1 ? "person" : "people"}. Claude is drafting their emails.`);
      url.set({ tab: undefined, id: undefined, rule: undefined });
      setPoll(4000);
    } catch {
      // Toast already shown.
    }
  };

  /** After sending, snoozing or dismissing: open the next one in the queue. */
  const afterDone = () => {
    const after = items[index + 1] ?? items[index - 1];
    open(narrow ? undefined : after?.id);
  };

  const showList = !narrow || !selected;
  const showDetail = !!selected && tab !== "rules";
  const tabLabel = TABS.find((t) => t.key === listTab)?.label.toLowerCase() ?? "";

  return (
    <>
      <PageHeader
        title="Follow-ups"
        subtitle={
          data
            ? `${formatNumber(data.counts.suggested)} waiting for your review · ${formatNumber(data.sentToday)} of ${formatNumber(data.dailyLimit)} emails sent today`
            : " "
        }
        actions={
          <button type="button" onClick={find} disabled={runState.isLoading || drafting} className={buttonClass.secondary}>
            {runState.isLoading || drafting ? <Spinner size="xs" tone="current" /> : <RefreshCw size={15} aria-hidden="true" />}
            {drafting ? "Claude is drafting…" : "Find follow-ups now"}
          </button>
        }
      />

      <div role="tablist" aria-label="Follow-ups" className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {[...TABS, { key: "rules" as const, label: "Rules" }].map((t) => {
          const on = t.key === tab;
          const n = t.key === "rules" ? undefined : data?.counts[t.key];
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => url.set({ tab: t.key === "suggested" ? undefined : t.key, id: undefined, rule: undefined })}
              className={cn(
                "-mb-px inline-flex h-[42px] shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 text-sm transition-colors",
                t.key === "rules" && "ml-auto",
                on ? "border-ink font-bold text-ink" : "border-transparent font-medium text-subtle hover:text-ink"
              )}
            >
              {t.key === "rules" && <SlidersHorizontal size={14} aria-hidden="true" />}
              {t.label}
              {n !== undefined && <span className="font-medium text-muted tabular-nums">{formatNumber(n)}</span>}
            </button>
          );
        })}
      </div>

      {isLoading || (!data && !isError) ? (
        <LoadingBlock label="Loading follow-ups" />
      ) : !data ? (
        <ErrorState onRetry={refetch} />
      ) : tab === "rules" ? (
        <RulesView rules={data.rules} />
      ) : all.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState title={listTab === "suggested" ? "Nobody to follow up with right now" : `Nothing ${tabLabel} yet`}>
            {listTab === "suggested" ? (
              <>
                Each morning Claude looks for students worth a personal email and drafts one for you to check. Press{" "}
                <b className="font-semibold text-ink">Find follow-ups now</b> to look straight away.
              </>
            ) : null}
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          {showList && (
            <section
              aria-label="People to follow up"
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-opacity xl:sticky xl:top-6 xl:max-h-[calc(100dvh-48px)]",
                isFetching && !drafting && "opacity-70"
              )}
            >
              <div className="flex items-center gap-2 border-b border-line py-2.5 pl-4 pr-2.5">
                <p className="mr-auto text-[13px] font-semibold text-ink">
                  {formatNumber(items.length)} {items.length === 1 ? "person" : "people"}
                </p>
                <SelectMenu
                  label="Rule"
                  value={rule}
                  placeholder
                  align="end"
                  options={[
                    { value: "", label: `All rules (${formatNumber(all.length)})` },
                    ...Object.entries(ruleCounts).map(([key, n]) => ({ value: key, label: `${ruleTitles[key] ?? key} (${formatNumber(n)})` })),
                  ]}
                  onChange={(v) => url.set({ rule: v || undefined, id: undefined })}
                />
              </div>
              <ul ref={listRef} className="flex flex-col divide-y divide-line overflow-y-auto overscroll-contain">
                {items.map((f) => {
                  const on = f.id === selected?.id;
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => open(f.id)}
                        aria-current={on ? "true" : undefined}
                        className={cn("flex w-full gap-3 px-4 py-3.5 text-left transition-colors", on ? "bg-hover" : "hover:bg-canvas")}
                      >
                        <Avatar initials={f.student.initials} seed={f.student.id} size={32} className="mt-0.5" />
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="flex items-baseline gap-2">
                            <span className={cn("truncate text-[14px] text-ink", on ? "font-bold" : "font-semibold")}>{f.student.name}</span>
                            {f.status === "drafting" && <Spinner size="xs" />}
                            <span className="ml-auto shrink-0 text-[11.5px] text-muted">{relativeTime(f.sentOn ?? f.createdOn)}</span>
                          </span>
                          <RuleTag rule={f.rule} title={f.ruleTitle} />
                          <span className="line-clamp-2 text-[12.5px] leading-snug text-subtle">
                            {f.status === "failed" ? <span className="text-danger">Draft failed. Open to try again.</span> : f.reason ?? (f.status === "drafting" ? "Drafting…" : "")}
                          </span>
                          {f.status === "sent" && (
                            <span className={cn("text-[12px] font-semibold", f.returnedOn || f.clickedOn ? "text-success-strong" : "text-muted")}>
                              {[f.clickedOn ? "Clicked the button" : null, f.returnedOn ? "came back" : null].filter(Boolean).join(" · ").replace(/^c/, "C") ||
                                "Not clicked or back yet"}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {items.length === 0 && <li className="px-4 py-6 text-[13px] text-muted">Nobody for this rule.</li>}
              </ul>
              {!narrow && listTab === "suggested" && items.length > 1 && (
                <p className="border-t border-line px-4 py-2 text-[11.5px] text-muted">
                  Press <kbd className="rounded border border-line px-1 font-mono text-[10.5px]">J</kbd> and{" "}
                  <kbd className="rounded border border-line px-1 font-mono text-[10.5px]">K</kbd> to move through the list.
                </p>
              )}
            </section>
          )}
          {showDetail && selected && (
            <Detail
              key={selected.id}
              f={selected}
              position={{ index, total: items.length }}
              onPrev={prev}
              onNext={next}
              onDone={afterDone}
              onBack={narrow ? () => open(undefined) : undefined}
            />
          )}
        </div>
      )}
    </>
  );
};

export default FollowUpsView;
