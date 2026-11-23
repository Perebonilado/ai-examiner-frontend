import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { Check, MessageCircleQuestion, RefreshCw, Undo2, X } from "lucide-react";
import { useGenerateIdeasMutation, useGetIdeasQuery, useUpdateIdeaMutation } from "@/api-services/admin.service";
import { Idea, IdeaStatus } from "@/models/insights.model";
import Spinner from "@/@shared/components/Spinner";
import { formatNumber, relativeTime } from "../format";
import { useUrlState } from "../useUrlState";
import { EmptyState, ErrorState, PageHeader, buttonClass } from "../ui";
import { useAsk } from "./AskPanel";
import { Quote } from "./insightsUi";

const TABS: { key: IdeaStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "planned", label: "Planned" },
  { key: "done", label: "Done" },
  { key: "dismissed", label: "Not now" },
];

const AREAS: Record<string, { label: string; color: string }> = {
  chat: { label: "Chat", color: "var(--viz-2)" },
  tests: { label: "Tests", color: "var(--viz-4)" },
  easy_read: { label: "Easy Read", color: "var(--viz-1)" },
  uploads: { label: "Uploads", color: "var(--viz-3)" },
  first_visit: { label: "First visit", color: "var(--viz-5)" },
  coming_back: { label: "Coming back", color: "var(--viz-6)" },
  pricing: { label: "Pricing", color: "var(--viz-7)" },
  other: { label: "Other", color: "var(--viz-prev)" },
};

const IMPACT = { high: "High impact", medium: "Medium impact", low: "Low impact" };
const EFFORT = { small: "Small effort (days)", medium: "Medium effort (1–3 weeks)", large: "Large effort" };

const IdeaCard: FC<{ idea: Idea }> = ({ idea }) => {
  const [update, { isLoading }] = useUpdateIdeaMutation();
  const { open } = useAsk();
  const [note, setNote] = useState(idea.note ?? "");
  const [noteOpen, setNoteOpen] = useState(false);
  const area = AREAS[idea.area] ?? AREAS.other;
  const set = (status: IdeaStatus) => update({ id: idea.id, status });

  return (
    <article aria-labelledby={`idea-${idea.id}`} className="grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl border border-line bg-surface p-5 md:p-6 xl:grid-cols-[minmax(0,1fr)_240px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-subtle">
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: area.color }} />
            {area.label}
          </span>
          <h2 id={`idea-${idea.id}`} className="text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink">
            {idea.title}
          </h2>
          <p className="max-w-[72ch] text-[14.5px] leading-relaxed text-body">{idea.problem}</p>
        </div>

        <div className="flex max-w-[72ch] flex-col gap-1.5">
          <h3 className="text-[13px] font-semibold text-ink">What to build</h3>
          <p className="text-[14.5px] leading-relaxed text-body">{idea.proposal}</p>
          {idea.firstStep && (
            <p className="text-[14px] leading-relaxed text-body">
              <b className="font-semibold text-ink">First step: </b>
              {idea.firstStep}
            </p>
          )}
        </div>

        {(idea.evidence.length > 0 || idea.examples.length > 0) && (
          <div className="flex flex-col gap-2.5 border-t border-line pt-4">
            <h3 className="text-[13px] font-semibold text-ink">The evidence</h3>
            {idea.evidence.length > 0 && (
              <ul className="flex max-w-[72ch] flex-col gap-1.5">
                {idea.evidence.map((e, i) => (
                  <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug text-body">
                    <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--viz-axis)]" />
                    {e}
                  </li>
                ))}
              </ul>
            )}
            {idea.examples.length > 0 && (
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {idea.examples.map((x) => (
                  <Link
                    key={x.key}
                    href={x.kind === "chat" ? `/admin/conversations/${x.key}` : `/admin/tests/${x.key}`}
                    className="group flex flex-col gap-1.5 rounded-xl border border-line p-3 transition-colors hover:border-control"
                  >
                    {x.quote ? <Quote className="bg-transparent p-0">“{x.quote}”</Quote> : null}
                    <span className="line-clamp-2 text-[12.5px] leading-snug text-subtle">{x.summary}</span>
                    <span className="text-[12px] font-semibold text-accent group-hover:text-accent-900">
                      Open the {x.kind === "chat" ? "conversation" : "test"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4 xl:border-l xl:border-line xl:pl-6">
        <dl className="grid grid-cols-3 gap-4 xl:grid-cols-1 xl:gap-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[12px] text-muted">Impact</dt>
            <dd className={cn("text-[14px] font-semibold", idea.impact === "high" ? "text-ink" : "text-body")}>{IMPACT[idea.impact]}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[12px] text-muted">Effort</dt>
            <dd className="text-[14px] font-semibold text-body">{EFFORT[idea.effort]}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[12px] text-muted">Students affected</dt>
            <dd className="text-[14px] font-semibold text-body tabular-nums">about {formatNumber(idea.studentsAffected)}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 xl:flex-col">
          {idea.status === "new" ? (
            <>
              <button type="button" disabled={isLoading} onClick={() => set("planned")} className={cn(buttonClass.secondary, "h-9 xl:w-full")}>
                <Check size={15} aria-hidden="true" />
                Plan it
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => set("dismissed")}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink xl:w-full"
              >
                <X size={15} aria-hidden="true" />
                Not now
              </button>
            </>
          ) : idea.status === "planned" ? (
            <>
              <button type="button" disabled={isLoading} onClick={() => set("done")} className={cn(buttonClass.secondary, "h-9 xl:w-full")}>
                <Check size={15} aria-hidden="true" />
                Mark as done
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => set("new")}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink xl:w-full"
              >
                <Undo2 size={15} aria-hidden="true" />
                Unplan
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => set(idea.status === "done" ? "planned" : "new")}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink xl:w-full"
            >
              <Undo2 size={15} aria-hidden="true" />
              {idea.status === "done" ? "Back to planned" : "Back to new"}
            </button>
          )}
          <button
            type="button"
            onClick={() => open(`Tell me more about this idea and how we'd build it: “${idea.title}”. Which students would it help first?`)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-accent transition-colors hover:bg-hover xl:w-full"
          >
            <MessageCircleQuestion size={15} aria-hidden="true" />
            Discuss with Claude
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {noteOpen ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update({ id: idea.id, note });
                setNoteOpen(false);
              }}
              className="flex flex-col gap-1.5"
            >
              <label htmlFor={`note-${idea.id}`} className="text-[12px] text-muted">
                Team note (Claude reads it next time)
              </label>
              <textarea
                id={`note-${idea.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-[10px] border border-control bg-surface px-3 py-2 text-[16px] text-ink focus:border-ink focus:outline-none md:text-[13px]"
              />
              <div className="flex gap-2">
                <button type="submit" className={cn(buttonClass.small, "h-8")}>
                  Save note
                </button>
                <button type="button" onClick={() => setNoteOpen(false)} className="h-8 px-2 text-[12.5px] font-semibold text-subtle hover:text-ink">
                  Cancel
                </button>
              </div>
            </form>
          ) : idea.note ? (
            <button type="button" onClick={() => setNoteOpen(true)} className="text-left text-[12.5px] leading-snug text-body hover:text-ink">
              <span className="text-muted">Note: </span>
              {idea.note}
            </button>
          ) : (
            <button type="button" onClick={() => setNoteOpen(true)} className="w-fit text-[12.5px] font-semibold text-subtle hover:text-ink">
              Add a note
            </button>
          )}
          {idea.statusBy && idea.status !== "new" && (
            <p className="text-[11.5px] text-muted">
              {TABS.find((t) => t.key === idea.status)?.label} by {idea.statusBy} {relativeTime(idea.updatedOn).toLowerCase()}
            </p>
          )}
        </div>
      </aside>
    </article>
  );
};

/** What Claude suggests building, from what students run into. */
const IdeasView: FC = () => {
  const url = useUrlState();
  const tab = (TABS.find((t) => t.key === url.get("tab"))?.key ?? "new") as IdeaStatus;
  const [poll, setPoll] = useState(0);
  const { data, isLoading, isError, refetch } = useGetIdeasQuery({ status: tab }, { skip: !url.ready, pollingInterval: poll });
  const [generate, { isLoading: starting }] = useGenerateIdeasMutation();
  const running = !!data?.running || starting;

  useEffect(() => setPoll(running ? 5000 : 0), [running]);

  return (
    <>
      <PageHeader
        title="Ideas"
        subtitle={
          data?.generatedOn
            ? `What Claude suggests building, from the last 90 days of chats, tests, sign-ups and drop-offs · written ${relativeTime(data.generatedOn).toLowerCase()} · new ideas every Monday`
            : "What Claude suggests building, from the last 90 days of chats, tests, sign-ups and drop-offs"
        }
        actions={
          <button type="button" onClick={() => generate()} disabled={running} className={buttonClass.secondary}>
            {running ? <Spinner size="xs" tone="current" /> : <RefreshCw size={15} aria-hidden="true" />}
            {running ? "Claude is thinking…" : "Find new ideas"}
          </button>
        }
      />

      <div role="tablist" aria-label="Ideas" className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {TABS.map((t) => {
          const on = t.key === tab;
          const n = data?.counts[t.key];
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => url.set({ tab: t.key === "new" ? undefined : t.key })}
              className={cn(
                "-mb-px inline-flex h-[42px] shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 text-sm transition-colors",
                on ? "border-ink font-bold text-ink" : "border-transparent font-medium text-subtle hover:text-ink"
              )}
            >
              {t.label}
              {n !== undefined && <span className="font-medium text-muted tabular-nums">{formatNumber(n)}</span>}
            </button>
          );
        })}
      </div>

      {data?.error && !running && <p className="rounded-xl bg-danger-bg px-4 py-3 text-[13.5px] text-danger-strong">{data.error}</p>}

      {isLoading || (!data && !isError) ? (
        <div className="flex flex-col gap-4" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6">
              <span className="h-3 w-24 animate-pulse rounded-full bg-hover" />
              <span className="h-5 w-2/3 animate-pulse rounded-full bg-hover" />
              <span className="h-3.5 w-full animate-pulse rounded-full bg-hover" />
              <span className="h-3.5 w-5/6 animate-pulse rounded-full bg-hover" />
            </div>
          ))}
        </div>
      ) : !data ? (
        <ErrorState onRetry={refetch} />
      ) : running && tab === "new" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <Spinner size="sm" />
          <p className="text-[14px] font-semibold text-ink">Claude is reading the last 90 days</p>
          <p className="max-w-[52ch] text-[13px] leading-relaxed text-subtle">
            Every labelled chat and test, the fix ideas, what students said, the sign-up funnel and who comes back. This takes a minute or two.
          </p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState title={tab === "new" ? "No new ideas yet" : `Nothing ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} yet`}>
            {tab === "new" ? (
              <>
                Claude reads everything labelled in the last 90 days, plus sign-ups, drop-offs and test completion, and suggests what to build next. Press{" "}
                <b className="font-semibold text-ink">Find new ideas</b> (about $0.30) or wait for Monday’s run.
              </>
            ) : (
              "Ideas you mark here show up in this list."
            )}
          </EmptyState>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data.items.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </>
  );
};

export default IdeasView;
