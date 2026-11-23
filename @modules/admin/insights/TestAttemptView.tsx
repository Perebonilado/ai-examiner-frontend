import React, { CSSProperties, FC } from "react";
import Link from "next/link";
import cn from "classnames";
import { Check, ChevronLeft, ChevronRight, Flag, Maximize2, Minus, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useGetTestAttemptQuery } from "@/api-services/admin.service";
import { TestAttemptDetail } from "@/models/insights.model";
import { formatDayAndTime, formatNumber } from "../format";
import { Avatar, Breadcrumb, ErrorState, LoadingBlock, buttonClass } from "../ui";
import { LabelCard } from "./insightsUi";

const madeLine = (d: TestAttemptDetail) =>
  `Made ${formatDayAndTime(d.madeOn)} · last answer ${formatDayAndTime(d.lastAnswerOn)}${d.difficulty ? ` · ${d.difficulty}` : ""}`;

/** Status, answered, right and best score as one quiet row. */
const Stats: FC<{ d: TestAttemptDetail; className?: string }> = ({ d, className }) => {
  const answered = d.questions.filter((q) => q.answered);
  const right = answered.filter((q) => q.right).length;
  const best = d.scores.length ? Math.max(...d.scores.map((s) => s.score)) : null;
  return (
    <dl className={cn("flex flex-wrap gap-x-8 gap-y-3", className)}>
      {[
        ["Status", d.status === "finished" ? "Finished" : "Stopped part-way"],
        ["Answered", `${formatNumber(answered.length)} of ${formatNumber(d.questions.length)}`],
        ["Right", answered.length ? `${formatNumber(right)} of ${formatNumber(answered.length)}` : "–"],
        ["Best score", best !== null ? `${Math.round(best)}%` : "–"],
      ].map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <dt className="text-[12px] text-muted">{k}</dt>
          <dd className="text-[16px] font-semibold text-ink tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
};

/** Every question: what they picked, whether it was right, and the right answer when not. */
const Questions: FC<{ d: TestAttemptDetail }> = ({ d }) => (
  <ol className="divide-y divide-line">
    {d.questions.map((q) => (
      <li key={q.number} className={cn("flex gap-3 py-4", !q.answered && "opacity-55")}>
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
            !q.answered ? "bg-hover text-muted" : q.right ? "bg-success-bg text-success-strong" : q.right === false ? "bg-danger-bg text-danger-strong" : "bg-hover text-subtle"
          )}
        >
          {!q.answered ? <Minus size={13} /> : q.right ? <Check size={13} strokeWidth={2.6} /> : q.right === false ? <X size={13} strokeWidth={2.6} /> : <Minus size={13} />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="text-[14px] leading-relaxed text-ink">
            <span className="mr-1.5 font-mono text-[12px] text-muted">Q{q.number}</span>
            {q.question}
          </p>
          {(q.topic || q.flagged) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
              {q.topic && <span className="text-muted">{q.topic}</span>}
              {q.flagged && (
                <span className="inline-flex items-center gap-1 font-semibold text-danger">
                  <Flag size={12} aria-hidden="true" />
                  Reported by the student
                </span>
              )}
            </div>
          )}
          {q.answered ? (
            <div className="flex flex-col gap-1 text-[13.5px]">
              <p>
                <span className="text-subtle">Picked </span>
                <span className={cn(q.right === false ? "text-danger-strong" : "text-ink")}>{q.chosen}</span>
              </p>
              {q.right === false && q.correct && (
                <p>
                  <span className="text-subtle">Right answer </span>
                  <span className="text-success-strong">{q.correct}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-[12.5px] text-muted">Not answered</p>
          )}
        </div>
      </li>
    ))}
  </ol>
);

/** Claude's read, the student's own rating, and every score on this test. */
const Side: FC<{ d: TestAttemptDetail; bare?: boolean }> = ({ d, bare = false }) => {
  const box = bare ? "border-t border-line pt-4" : "rounded-2xl border border-line bg-surface p-4";
  return (
    <div className={cn("flex flex-col", bare ? "gap-4" : "gap-4")}>
      <LabelCard label={d.label} kind="test" bare={bare} />
      {d.rating && (
        <section className={cn("flex items-start gap-2.5 text-[13px]", box)}>
          {d.rating.value > 0 ? (
            <ThumbsUp size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <ThumbsDown size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
          )}
          <p className="text-body">
            The student rated this test <b className="font-semibold text-ink">{d.rating.value > 0 ? "useful" : "not useful"}</b>
            {d.rating.comment ? `: “${d.rating.comment}”` : "."}
          </p>
        </section>
      )}
      {d.scores.length > 1 && (
        <section className={cn("flex flex-col gap-2", box)}>
          <h3 className="text-[13px] font-semibold text-ink">Every attempt at this test</h3>
          <ul className="flex flex-col gap-1 text-[13px]">
            {d.scores.map((s, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-subtle">{formatDayAndTime(s.at)}</span>
                <b className="font-semibold text-ink tabular-nums">{Math.round(s.score)}%</b>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

const iconButton =
  "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-body transition-colors hover:border-control hover:text-ink disabled:opacity-35";

/** The reading pane beside the attempts list. */
export const TestAttemptPane: FC<{
  attemptKey: string;
  position: { index: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  style?: CSSProperties;
}> = ({ attemptKey, position, onPrev, onNext, onClose, style }) => {
  const { data, isLoading, isError, refetch } = useGetTestAttemptQuery(attemptKey);
  return (
    <article aria-label="Test attempt" style={style} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface xl:sticky">
      <header className="flex items-start gap-3 border-b border-line px-5 py-4">
        {data ? (
          <>
            <Avatar initials={data.student.initials} seed={data.student.userId ?? data.key} size={38} className="mt-0.5" />
            <div className="mr-auto flex min-w-0 flex-col gap-0.5">
              {data.student.userId ? (
                <Link href={`/admin/users/${data.student.userId}`} className="w-fit text-[16px] font-bold leading-snug text-ink hover:text-accent">
                  {data.student.name}
                </Link>
              ) : (
                <b className="text-[16px] font-bold leading-snug text-ink">{data.student.name}</b>
              )}
              <p className="flex min-w-0 items-baseline gap-1.5 text-[13.5px] text-subtle">
                <span className="shrink-0">{data.type} on</span>
                <Link href={`/admin/documents/${data.documentId}`} className="truncate font-semibold text-accent hover:text-accent-900" title={data.documentTitle}>
                  {data.documentTitle}
                </Link>
              </p>
              <p className="text-[12.5px] text-muted">{madeLine(data)}</p>
            </div>
          </>
        ) : (
          <p className="mr-auto py-2 text-[13px] text-subtle">Loading the attempt…</p>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {position.total > 1 && (
            <>
              <span className="mr-1 hidden font-mono text-[12px] text-muted tabular-nums 2xl:inline">
                {position.index + 1} of {position.total}
              </span>
              <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous attempt (K)" title="Previous (K)" className={iconButton}>
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next attempt (J)" title="Next (J)" className={iconButton}>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </>
          )}
          <Link href={`/admin/tests/${attemptKey}`} aria-label="Open on its own page" title="Open on its own page" className={iconButton}>
            <Maximize2 size={14} aria-hidden="true" />
          </Link>
          <button type="button" onClick={onClose} aria-label="Close" title="Close" className={iconButton}>
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      {isLoading ? (
        <LoadingBlock label="Loading the attempt" className="py-16" />
      ) : !data ? (
        isError ? <ErrorState title="We couldn't load this attempt." onRetry={refetch} /> : null
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-h-0 overflow-y-auto overscroll-contain">
            <Stats d={data} className="border-b border-line px-5 py-4" />
            <div className="border-b border-line px-5 py-4 2xl:hidden">
              <Side d={data} bare />
            </div>
            <div className="px-5 pb-2">
              <Questions d={data} />
            </div>
          </div>
          <aside aria-label="Claude’s read" className="hidden min-h-0 overflow-y-auto overscroll-contain border-l border-line px-5 py-5 2xl:block">
            <Side d={data} bare />
          </aside>
        </div>
      )}
    </article>
  );
};

/** One student's attempt on its own page: every question, what they picked, and Claude's read. */
const TestAttemptView: FC<{ attemptKey: string }> = ({ attemptKey }) => {
  const { data, isLoading, isError, refetch } = useGetTestAttemptQuery(attemptKey, { refetchOnMountOrArgChange: true });

  if (isLoading) return <LoadingBlock label="Loading the attempt" />;
  if (!data) return isError ? <ErrorState title="We couldn't load this attempt." onRetry={refetch} /> : null;

  return (
    <>
      <Breadcrumb parent={{ label: "Tests", href: "/admin/tests" }} current={data.student.name} />
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Avatar initials={data.student.initials} seed={data.student.userId ?? data.key} size={44} />
        <div className="mr-auto flex min-w-0 flex-col gap-1">
          <h1 className="text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink">{data.student.name}</h1>
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-[13.5px] text-subtle">
            {data.type} test on
            <Link href={`/admin/documents/${data.documentId}`} className="min-w-0 truncate font-semibold text-accent hover:text-accent-900">
              {data.documentTitle}
            </Link>
          </p>
          <p className="text-[12.5px] text-muted">{madeLine(data)}</p>
        </div>
        {data.student.userId && (
          <Link href={`/admin/users/${data.student.userId}`} className={buttonClass.small}>
            Student profile
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Questions" className="min-w-0 rounded-2xl border border-line bg-surface">
          <Stats d={data} className="border-b border-line px-5 py-4 md:px-6" />
          <div className="px-5 md:px-6">
            <Questions d={data} />
          </div>
        </section>
        <div className="lg:sticky lg:top-6">
          <Side d={data} />
        </div>
      </div>
    </>
  );
};

export default TestAttemptView;
