import React, { FC, ReactNode, useState } from "react";
import cn from "classnames";
import { Check, Flag, Quote as QuoteIcon, Wrench } from "lucide-react";
import { useCorrectLabelMutation } from "@/api-services/admin.service";
import { AiLabel, Mood } from "@/models/insights.model";
import { formatNumber } from "../format";
import { Chip } from "../ui";
import { DOC_KINDS, FIELDS, INTENTS, LEVELS, MOODS, MOOD_ORDER, OUTCOMES, QUALITY, issueLabel } from "./insightsText";

/** Satisfied / Neutral / Frustrated / Unclear, with a dot for scanning down a list. */
export const MoodChip: FC<{ mood: Mood | null | undefined; pending?: boolean; className?: string }> = ({
  mood,
  pending,
  className,
}) => {
  if (pending)
    return (
      <span className={cn("inline-flex h-[22px] items-center gap-1.5 rounded-[7px] bg-hover px-2 text-[11.5px] font-bold text-subtle", className)}>
        <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--viz-primary)] motion-reduce:animate-none" />
        Labelling
      </span>
    );
  if (!mood) return <span className={cn("text-[12px] text-faint", className)}>Not labelled</span>;
  const m = MOODS[mood];
  return (
    <Chip tone={m.tone} className={cn("gap-1.5", className)}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </Chip>
  );
};

/** A thin bar split by mood, with the counts for screen readers. */
export const MoodBar: FC<{ moods: Partial<Record<Mood, number>>; className?: string; height?: number }> = ({
  moods,
  className,
  height = 8,
}) => {
  const total = MOOD_ORDER.reduce((a, m) => a + (moods[m] ?? 0), 0);
  return (
    <div className={cn("flex w-full gap-[2px] overflow-hidden rounded-full bg-hover", className)} style={{ height }}>
      {total > 0 &&
        MOOD_ORDER.filter((m) => moods[m]).map((m) => (
          <span
            key={m}
            title={`${MOODS[m].label}: ${formatNumber(moods[m] ?? 0)}`}
            style={{ width: `${((moods[m] ?? 0) / total) * 100}%`, background: MOODS[m].color }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      <span className="sr-only">
        {MOOD_ORDER.map((m) => `${MOODS[m].label} ${moods[m] ?? 0}`).join(", ")}
      </span>
    </div>
  );
};

export const MoodLegend: FC<{ moods?: Partial<Record<Mood, number>> }> = ({ moods }) => (
  <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-subtle">
    {MOOD_ORDER.map((m) => (
      <li key={m} className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-2 w-2 rounded-[3px]" style={{ background: MOODS[m].color }} />
        {MOODS[m].label}
        {moods && <b className="font-semibold text-ink tabular-nums">{formatNumber(moods[m] ?? 0)}</b>}
      </li>
    ))}
  </ul>
);

export const Quote: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <blockquote className={cn("flex gap-2 rounded-[10px] bg-well px-3 py-2.5 text-[13px] leading-relaxed text-body", className)}>
    <QuoteIcon size={14} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
    <span className="min-w-0 italic">{children}</span>
  </blockquote>
);

/** Claude's read of one item, with a way to correct it. */
export const LabelCard: FC<{
  label: AiLabel | null;
  kind: "chat" | "test" | "document";
  className?: string;
  /** Without its own border and padding, for use inside a panel. */
  bare?: boolean;
  /** The student's quote in English, when the page is showing a translation. */
  quoteInEnglish?: string | null;
}> = ({ label, kind, className, bare = false, quoteInEnglish }) => {
  const shell = bare ? "" : "rounded-2xl border border-line bg-surface p-4";
  const [correct, { isLoading }] = useCorrectLabelMutation();
  const [fixing, setFixing] = useState(false);
  const [current, setCurrent] = useState(label);
  const l = current ?? label;

  if (!l || l.status === "pending")
    return (
      <section aria-label="Claude’s read" className={cn(shell, className)}>
        <p className="text-[13px] text-subtle">
          {l?.status === "pending" ? "Claude is labelling this now. Check back shortly." : "Not labelled yet."}
        </p>
      </section>
    );
  if (l.status !== "done")
    return (
      <section aria-label="Claude’s read" className={cn(shell, className)}>
        <p className="text-[13px] text-subtle">Claude couldn’t label this one.</p>
      </section>
    );

  const set = async (body: { mood?: string | null; wrong?: boolean }) => {
    try {
      const updated = await correct({ id: l.id, ...body }).unwrap();
      setCurrent(updated);
      setFixing(false);
    } catch {
      // The error toast says so.
    }
  };

  const rows: [string, ReactNode][] = [];
  if (kind === "document") {
    const d = l.details;
    if (d.subject) rows.push(["Subject", d.subject]);
    if (d.field) rows.push(["Field", FIELDS[d.field] ?? d.field]);
    if (d.kind) rows.push(["Kind", DOC_KINDS[d.kind] ?? d.kind]);
    if (d.level) rows.push(["Level", LEVELS[d.level] ?? d.level]);
    if (d.language) rows.push(["Language", d.language]);
    if (d.quality) rows.push(["Text", QUALITY[d.quality] ?? d.quality]);
  }
  if (kind !== "document") {
    if (l.intent) rows.push(["Wanted", INTENTS[l.intent] ?? l.intent]);
    if (l.outcome) rows.push(["How it went", OUTCOMES[l.outcome] ?? l.outcome]);
    if (l.details.stopReason && l.details.stopReason !== "not_applicable")
      rows.push(["Why they stopped", l.details.stopReason.replace(/_/g, " ")]);
    if (l.details.struggles?.length) rows.push(["Struggled with", l.details.struggles.join(", ")]);
    if (l.details.strengths?.length) rows.push(["Did well on", l.details.strengths.join(", ")]);
  }

  return (
    <section aria-label="Claude’s read" className={cn("flex flex-col gap-3", shell, className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-[13px] font-bold text-ink">Claude’s read</h2>
        {kind !== "document" && <MoodChip mood={l.mood} />}
        {l.confidence && kind !== "document" && (
          <span className="text-[11.5px] text-muted">{l.confidence} confidence</span>
        )}
      </div>
      {l.summary && <p className="text-[14px] leading-relaxed text-ink">{l.summary}</p>}
      {l.quote && (
        <div className="flex flex-col gap-1.5">
          <Quote>“{quoteInEnglish || l.quote}”</Quote>
          {quoteInEnglish && <p className="px-1 text-[11.5px] text-muted">Translated. They wrote: “{l.quote}”</p>}
        </div>
      )}
      {rows.length > 0 && (
        <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[13px]">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-subtle">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {l.issues.length > 0 && (
        <ul aria-label="What went wrong" className="flex flex-wrap gap-1.5">
          {l.issues.map((i) => (
            <li key={i}>
              <span className="inline-flex h-6 items-center rounded-[7px] border border-line px-2 text-[12px] text-body">
                {issueLabel(i)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {l.fixIdea && (
        <p className="flex gap-2 text-[13px] text-body">
          <Wrench size={14} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
          <span>
            <b className="font-semibold text-ink">Fix idea: </b>
            {l.fixIdea}
          </span>
        </p>
      )}
      {kind !== "document" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          {l.corrected ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-success-strong">
              <Check size={13} strokeWidth={2.4} aria-hidden="true" />
              Corrected{l.originalMood && l.mood !== l.originalMood ? ` (Claude said ${MOODS[l.originalMood].label.toLowerCase()})` : ""}
            </span>
          ) : (
            <span className="text-[12px] text-muted">Is this right?</span>
          )}
          {!fixing ? (
            <button
              type="button"
              onClick={() => setFixing(true)}
              className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2 text-[12px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink"
            >
              <Flag size={13} strokeWidth={2} aria-hidden="true" />
              Correct the mood
            </button>
          ) : (
            <div role="group" aria-label="The right mood" className="ml-auto flex flex-wrap gap-1">
              {MOOD_ORDER.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={isLoading}
                  onClick={() => set({ mood: m })}
                  className={cn(
                    "h-7 rounded-[8px] border px-2 text-[12px] font-semibold transition-colors",
                    l.mood === m ? "border-ink text-ink" : "border-line text-body hover:border-control"
                  )}
                >
                  {MOODS[m].label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
