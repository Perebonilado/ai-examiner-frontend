import React, { FC, FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { ArrowRight, ArrowUp, ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  useGetFollowUpsQuery,
  useGetInsightsOverviewQuery,
  useGetLabelsQuery,
  useGetTestsSummaryQuery,
} from "@/api-services/admin.service";
import { DayRange } from "@/models/admin.model";
import { FeatureInsight, LabelKind } from "@/models/insights.model";
import { formatDayAndTime, formatNumber, todayKey } from "../format";
import { addDays, rangePhrase, rangeQuery, readRange } from "../range";
import { useUrlState } from "../useUrlState";
import { DateRangePicker } from "../kit/DateRangePicker";
import { BarList } from "../charts/Panels";
import { StackedHistogram } from "../charts/StackedHistogram";
import { Avatar, Card, ErrorState, LoadingBlock, PageHeader } from "../ui";
import { useAsk } from "./AskPanel";
import { CoveragePanel } from "./CoveragePanel";
import { ThemesReport } from "./ThemesReport";
import { BehaviourPanel } from "./BehaviourPanel";
import {
  CHAT_ISSUES,
  DOC_KINDS,
  FIELDS,
  INTENTS,
  LEVELS,
  MOODS,
  MOOD_ORDER,
  OUTCOMES,
  QUALITY,
  STOP_REASONS,
  TEST_ISSUES,
  issueLabel,
  netMood,
  share,
} from "./insightsText";
import { MoodBar, MoodLegend, Quote } from "./insightsUi";

const ASK_IDEAS = [
  "Who should I follow up with this week?",
  "What do frustrated students have in common?",
  "Which documents get the most use after upload?",
];

/** Query-string for the same range on another admin page. */
const rangeLink = (range: DayRange, today: string, extra: Record<string, string> = {}) => {
  const q = { ...rangeQuery(range, today), ...extra } as Record<string, string | undefined>;
  return new URLSearchParams(Object.entries(q).filter((e): e is [string, string] => !!e[1])).toString();
};

const pctText = (n: number, of: number) => `${Math.round(share(n, of))}%`;

/* ---------- Pieces ---------- */

const Section: FC<{ id?: string; title: string; sub?: ReactNode; children: ReactNode; className?: string }> = ({ id, title, sub, children, className }) => (
  <Card className={cn("flex flex-col gap-4 p-4 md:p-5", className)} labelledBy={id ? `${id}-title` : undefined}>
    <div className="flex flex-col gap-0.5">
      <h2 id={id ? `${id}-title` : undefined} className="text-[15px] font-bold text-ink">
        {title}
      </h2>
      {sub && <p className="text-[13px] text-subtle">{sub}</p>}
    </div>
    {children}
  </Card>
);

const Sub: FC<{ title: string; children: ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn("flex min-w-0 flex-col gap-2", className)}>
    <h3 className="text-[13px] font-bold text-subtle">{title}</h3>
    {children}
  </div>
);

const Empty: FC<{ children: ReactNode }> = ({ children }) => <p className="py-4 text-[13px] text-muted">{children}</p>;

/** Ask box at the top of the page: opens the panel with the question. */
const AskBar: FC = () => {
  const { open } = useAsk();
  const [text, setText] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return open();
    open(text.trim());
    setText("");
  };
  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl border border-control bg-surface py-1.5 pl-4 pr-1.5 shadow-xs transition-colors focus-within:border-ink">
        <label htmlFor="insights-ask" className="sr-only">
          Ask Claude about your students
        </label>
        <input
          id="insights-ask"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask Claude anything about your students"
          className="h-10 min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-faint focus:outline-none md:text-[14.5px]"
        />
        <kbd className="hidden rounded-[6px] border border-line px-1.5 font-mono text-[10.5px] text-muted md:block">⌘K</kbd>
        <button type="submit" aria-label="Ask" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-surface">
          <ArrowUp size={17} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </form>
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
        {ASK_IDEAS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => open(q)}
            className="h-8 shrink-0 rounded-full border border-line bg-surface px-3 text-[12.5px] font-medium text-body transition-colors hover:border-control hover:text-ink"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

/** One "needs you" tile: a number and where to act on it. */
const Todo: FC<{ n: number | undefined; label: string; href: string; tone?: "accent" | "danger" | "plain" }> = ({ n, label, href, tone = "plain" }) => (
  <Link
    href={href}
    className="group flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-control"
  >
    <span
      className={cn(
        "font-mono text-[22px] font-semibold leading-none tabular-nums",
        !n ? "text-faint" : tone === "danger" ? "text-danger" : tone === "accent" ? "text-accent" : "text-ink"
      )}
    >
      {n === undefined ? "–" : formatNumber(n)}
    </span>
    <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-body">{label}</span>
    <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
  </Link>
);

/** A mood tile: the satisfied share, the bar, the frustrated share. */
const MoodTile: FC<{ title: string; f: FeatureInsight; href: string }> = ({ title, f, href }) => {
  const total = MOOD_ORDER.reduce((a, m) => a + (f.moods[m] ?? 0), 0);
  const net = netMood(f.moods);
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-baseline gap-2">
        <h2 className="mr-auto text-[13px] font-semibold text-subtle">{title}</h2>
        <Link href={href} className="text-[12px] font-semibold text-accent hover:text-accent-900">
          Read them
        </Link>
      </div>
      {total ? (
        <>
          <p className="flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">
              {pctText(f.moods.satisfied ?? 0, total)}
            </span>
            <span className="text-[13px] text-subtle">satisfied</span>
            <span className="ml-auto font-mono text-[12px] text-muted tabular-nums" title="Satisfied minus frustrated, as a share of everything labelled">
              net {net !== null && net > 0 ? "+" : ""}
              {net ?? "–"}
            </span>
          </p>
          <MoodBar moods={f.moods} height={8} />
          <p className="text-[12.5px] text-subtle">
            <b className="font-semibold text-danger">{pctText(f.moods.frustrated ?? 0, total)} frustrated</b> · {formatNumber(total)} labelled
          </p>
        </>
      ) : (
        <p className="py-3 text-[13px] text-muted">Nothing labelled in these dates yet.</p>
      )}
    </Card>
  );
};

const RatingsTile: FC<{ feedback: Record<"chat" | "test" | "easyRead", { up: number; down: number }> }> = ({ feedback }) => {
  const up = feedback.chat.up + feedback.test.up + feedback.easyRead.up;
  const down = feedback.chat.down + feedback.test.down + feedback.easyRead.down;
  return (
    <Card className="flex flex-col gap-3 p-4">
      <h2 className="text-[13px] font-semibold text-subtle">Students’ own ratings</h2>
      {up + down ? (
        <>
          <p className="flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">{pctText(up, up + down)}</span>
            <span className="text-[13px] text-subtle">helpful</span>
          </p>
          <ul className="flex flex-col gap-1 text-[12.5px] text-subtle">
            {(
              [
                ["Chat answers", feedback.chat],
                ["Tests", feedback.test],
                ["Easy Read", feedback.easyRead],
              ] as const
            ).map(([k, v]) => (
              <li key={k} className="flex items-center gap-2">
                <span className="mr-auto">{k}</span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <ThumbsUp size={12} aria-label="Helpful" /> {formatNumber(v.up)}
                </span>
                <span className="inline-flex w-12 items-center justify-end gap-1 font-mono tabular-nums">
                  <ThumbsDown size={12} aria-label="Not helpful" /> {formatNumber(v.down)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-[13px] leading-snug text-muted">
          No ratings yet. Students now see thumbs up and down on chat answers, tests and Easy Read; their votes show here.
        </p>
      )}
    </Card>
  );
};

const AccuracyTile: FC<{ accuracy: { reviewed: number; wrong: number }; pending: number }> = ({ accuracy, pending }) => (
  <Card className="flex flex-col gap-3 p-4">
    <h2 className="text-[13px] font-semibold text-subtle">How often Claude is right</h2>
    {accuracy.reviewed ? (
      <>
        <p className="flex items-baseline gap-2">
          <span className="font-mono text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">
            {pctText(accuracy.reviewed - accuracy.wrong, accuracy.reviewed)}
          </span>
          <span className="text-[13px] text-subtle">of the labels you checked</span>
        </p>
        <p className="text-[12.5px] text-subtle">
          You marked {formatNumber(accuracy.wrong)} of {formatNumber(accuracy.reviewed)} wrong.
        </p>
      </>
    ) : (
      <p className="text-[13px] leading-snug text-muted">
        Not measured yet. When a label looks off on a conversation or test, mark it wrong or pick the right mood, and this fills in.
      </p>
    )}
    {pending > 0 && (
      <p className="mt-auto font-mono text-[11.5px] text-muted">
        {formatNumber(pending)} item{pending === 1 ? "" : "s"} with Claude now
      </p>
    )}
  </Card>
);

/** Mood per week, stacked; drag across weeks to zoom the page to them. */
const MoodWeeks: FC<{ f: FeatureInsight; caption: string; onZoom: (r: DayRange) => void; today: string }> = ({ f, caption, onZoom, today }) => {
  if (f.weeks.length < 2) return <Empty>Not enough weeks in these dates for a trend.</Empty>;
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <div className="flex flex-col gap-2">
      <StackedHistogram
        caption={caption}
        height={160}
        groups={MOOD_ORDER.map((m) => ({ key: m, label: MOODS[m].label, color: MOODS[m].color }))}
        buckets={f.weeks.map((w) => ({
          label: fmt.format(new Date(`${w.start}T12:00:00Z`)),
          title: `Week of ${fmt.format(new Date(`${w.start}T12:00:00Z`))}`,
          counts: { satisfied: w.satisfied, neutral: w.neutral, frustrated: w.frustrated, unclear: w.unclear },
        }))}
        onSelect={(a, b) => {
          const to = addDays(f.weeks[b].start, 6);
          onZoom({ from: f.weeks[a].start, to: to > today ? today : to });
        }}
      />
      <MoodLegend moods={f.moods} />
    </div>
  );
};

/** Test problems: each opens to a few real examples. */
const TestProblems: FC<{ issues: { key: string; count: number }[]; range: DayRange }> = ({ issues, range }) => {
  const [open, setOpen] = useState<string | null>(null);
  const max = Math.max(1, ...issues.map((i) => i.count));
  if (!issues.length) return <Empty>No problems flagged in these dates.</Empty>;
  return (
    <ul className="flex flex-col gap-1">
      {issues.slice(0, 8).map((i) => {
        const on = open === i.key;
        return (
          <li key={i.key} className="flex flex-col">
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i.key)}
              className="relative flex h-9 items-center gap-3 rounded-[8px] px-2.5 text-left transition-colors hover:bg-hover"
            >
              <span aria-hidden="true" className="absolute inset-y-0 left-0 rounded-[8px] bg-[var(--viz-bar)]" style={{ width: `${Math.max(1.5, (i.count / max) * 100)}%` }} />
              <span className="relative min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{TEST_ISSUES[i.key] ?? issueLabel(i.key)}</span>
              <b className="relative w-12 shrink-0 text-right text-[13px] font-bold text-ink tabular-nums">{formatNumber(i.count)}</b>
              <ChevronDown size={14} aria-hidden="true" className={cn("relative shrink-0 text-subtle transition-transform", on && "rotate-180")} />
            </button>
            {on && <Examples kind="test" issue={i.key} range={range} />}
          </li>
        );
      })}
    </ul>
  );
};

const Examples: FC<{ kind: LabelKind; issue: string; range: DayRange }> = ({ kind, issue, range }) => {
  const { data, isLoading } = useGetLabelsQuery({ kind, issue, from: range.from, to: range.to, pageSize: 4 });
  if (isLoading) return <LoadingBlock label="Loading examples" className="py-4" />;
  if (!data?.items.length) return <Empty>No examples found.</Empty>;
  return (
    <ul className="my-1.5 ml-2.5 flex flex-col gap-2 border-l-2 border-line pl-3">
      {data.items.map((x) => (
        <li key={x.key} className="flex flex-col gap-1">
          <Link href={kind === "test" ? `/admin/tests/${x.key}` : `/admin/conversations/${x.key}`} className="text-[13px] font-semibold text-ink hover:text-accent">
            {x.label.summary || x.documentTitle || "Open"}
          </Link>
          {x.label.quote && <Quote className="py-1.5">“{x.label.quote}”</Quote>}
          <span className="text-[11.5px] text-muted">
            {x.student.name} · {formatDayAndTime(x.occurredOn)}
          </span>
        </li>
      ))}
      {data.total > data.items.length && (
        <li className="text-[12px] text-muted">
          and {formatNumber(data.total - data.items.length)} more
        </li>
      )}
    </ul>
  );
};

const Chips: FC<{ rows: { key: string; count: number }[]; empty: string }> = ({ rows, empty }) =>
  rows.length ? (
    <ul className="flex flex-wrap gap-1.5">
      {rows.slice(0, 24).map((r) => (
        <li key={r.key} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-[12.5px] font-medium text-ink">
          {r.key}
          <span className="font-mono text-[11px] text-muted">{formatNumber(r.count)}</span>
        </li>
      ))}
    </ul>
  ) : (
    <Empty>{empty}</Empty>
  );

const rows = (list: { key: string; count: number }[], names: Record<string, string>, href?: (k: string) => string, limit = 8) =>
  list.slice(0, limit).map((r) => ({ key: r.key, label: names[r.key] ?? issueLabel(r.key), value: r.count, href: href?.(r.key) }));

/* ---------- Page ---------- */

/** Claude's read of every chat, test and upload: what's working, what isn't, and who needs you. */
const InsightsView: FC = () => {
  const url = useUrlState();
  const today = todayKey();
  const range = readRange(url.query, "this_year", today);
  const { data, isLoading, isError, isFetching, refetch } = useGetInsightsOverviewQuery(range, { skip: !url.ready, refetchOnMountOrArgChange: 60 });
  const { data: tests } = useGetTestsSummaryQuery(range, { skip: !url.ready });
  const { data: followUps } = useGetFollowUpsQuery({ status: "suggested" }, { skip: !url.ready });

  const setRange = (r: DayRange) => url.set(rangeQuery(r, today));
  const link = (path: string, extra: Record<string, string> = {}) => `${path}?${rangeLink(range, today, extra)}`;
  const waiting = followUps ? followUps.counts.suggested - followUps.counts.drafting : undefined;
  const labelled = data ? data.chat.labelled + data.test.labelled + data.documents.labelled : 0;

  return (
    <>
      <PageHeader
        title="Insights"
        subtitle={data ? `Claude has read ${formatNumber(labelled)} chats, tests and uploads ${rangePhrase(range, today)}` : " "}
        actions={<DateRangePicker label="Date range" value={range} stepper onChange={(r) => r && setRange(r)} />}
      />

      <AskBar />

      <section aria-label="Needs you" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <Todo n={waiting} label="follow-up emails waiting for you to review" href="/admin/follow-ups" tone="accent" />
        <Todo n={data?.chat.moods.frustrated} label={`frustrated chat conversations ${rangePhrase(range, today)}`} href={link("/admin/conversations", { mood: "frustrated" })} tone="danger" />
        <Todo n={tests ? tests.attempts.stopped : undefined} label="tests stopped before the end" href={link("/admin/tests", { status: "stopped" })} />
        <Todo n={tests?.flagged.length} label="test questions students reported as wrong" href="#reported-questions" />
      </section>

      {/* Live tracking loads on its own, so it shows even when the labels summary is slow. */}
      <BehaviourPanel range={range} />

      {isLoading || (!data && !isError) ? (
        <LoadingBlock label="Loading insights" />
      ) : !data ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className={cn("flex flex-col gap-5 transition-opacity", isFetching && "opacity-70")}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            <MoodTile title="Chat mood" f={data.chat} href={link("/admin/conversations")} />
            <MoodTile title="Test mood" f={data.test} href={link("/admin/tests")} />
            <RatingsTile feedback={data.feedback} />
            <AccuracyTile accuracy={data.accuracy} pending={data.pending} />
          </div>

          <ThemesReport range={range} today={today} />

          <Section id="chat" title="Chat" sub={`${formatNumber(data.chat.labelled)} conversations labelled ${rangePhrase(range, today)}. Drag across weeks to zoom in.`}>
            <MoodWeeks f={data.chat} caption="Chat conversations per week by mood" onZoom={setRange} today={today} />
            <div className="grid grid-cols-1 gap-5 border-t border-line pt-4 lg:grid-cols-3">
              <Sub title="What goes wrong">
                {data.chat.issues.length ? (
                  <BarList rows={rows(data.chat.issues, CHAT_ISSUES, (k) => link("/admin/conversations", { issue: k }))} />
                ) : (
                  <Empty>No problems found in these dates.</Empty>
                )}
              </Sub>
              <Sub title="What students ask for">
                {data.chat.intents.length ? <BarList rows={rows(data.chat.intents, INTENTS)} /> : <Empty>Nothing labelled yet.</Empty>}
              </Sub>
              <Sub title="How it ended">
                {data.chat.outcomes.length ? <BarList rows={rows(data.chat.outcomes, OUTCOMES)} /> : <Empty>Nothing labelled yet.</Empty>}
              </Sub>
            </div>
          </Section>

          <Section id="tests" title="Tests" sub={`${formatNumber(data.test.labelled)} test attempts labelled ${rangePhrase(range, today)}.`}>
            <MoodWeeks f={data.test} caption="Test attempts per week by mood" onZoom={setRange} today={today} />
            <div className="grid grid-cols-1 gap-5 border-t border-line pt-4 lg:grid-cols-3">
              <Sub title="Problems with the tests">
                <TestProblems issues={data.test.issues} range={range} />
              </Sub>
              <Sub title="Why students stop">
                {tests?.stopReasons.length ? <BarList rows={rows(tests.stopReasons, STOP_REASONS)} /> : <Empty>No stopped tests labelled yet.</Empty>}
              </Sub>
              <Sub title="Topics students struggle with">
                <Chips rows={tests?.struggles ?? []} empty="Nothing stands out yet." />
              </Sub>
            </div>
            {tests && tests.flagged.length > 0 && (
              <div id="reported-questions" className="flex scroll-mt-24 flex-col gap-2 border-t border-line pt-4">
                <h3 className="text-[13px] font-bold text-subtle">Questions students reported</h3>
                <ul className="flex flex-col divide-y divide-line">
                  {tests.flagged.slice(0, 8).map((q, i) => (
                    <li key={`${q.testId}-${q.number}-${i}`} className="flex gap-3 py-2.5">
                      <span className="w-8 shrink-0 font-mono text-[11.5px] text-muted">Q{q.number}</span>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-[13.5px] leading-snug text-ink">{q.question}</p>
                        <p className="flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-muted">
                          {q.topic && <span>{q.topic} ·</span>}
                          <span className="truncate">{q.documentTitle}</span>
                          <span>·</span>
                          {q.student.userId ? (
                            <Link href={`/admin/users/${q.student.userId}`} className="inline-flex items-center gap-1 font-semibold text-body hover:text-accent">
                              <Avatar initials={q.student.initials} seed={q.student.userId} size={16} />
                              {q.student.name}
                            </Link>
                          ) : (
                            <span>{q.student.name}</span>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section id="documents" title="Uploads" sub={`${formatNumber(data.documents.labelled)} documents labelled ${rangePhrase(range, today)}.`}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Sub title="Field of study">
                {data.documents.fields.length ? (
                  <BarList rows={rows(data.documents.fields, FIELDS, (k) => link("/admin/documents", { field: k }), 10)} />
                ) : (
                  <Empty>Nothing labelled yet.</Empty>
                )}
              </Sub>
              <Sub title="What they upload">
                {data.documents.kinds.length ? (
                  <BarList rows={rows(data.documents.kinds, DOC_KINDS, (k) => link("/admin/documents", { kind: k }))} />
                ) : (
                  <Empty>Nothing labelled yet.</Empty>
                )}
              </Sub>
              <div className="flex flex-col gap-5">
                <Sub title="Level">
                  {data.documents.levels.length ? <BarList rows={rows(data.documents.levels, LEVELS)} /> : <Empty>Nothing labelled yet.</Empty>}
                </Sub>
                <Sub title="Could the app read them?">
                  {data.documents.quality.length ? <BarList rows={rows(data.documents.quality, QUALITY)} /> : <Empty>Nothing labelled yet.</Empty>}
                </Sub>
              </div>
            </div>
            <Sub title="Most common subjects" className="border-t border-line pt-4">
              <Chips rows={data.documents.subjects} empty="Nothing labelled yet." />
            </Sub>
          </Section>

          <CoveragePanel />
        </div>
      )}
    </>
  );
};

export default InsightsView;
