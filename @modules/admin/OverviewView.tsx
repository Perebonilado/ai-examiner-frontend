import React, { FC, ReactNode, useMemo } from "react";
import Link from "next/link";
import cn from "classnames";
import { ArrowRight, Info } from "lucide-react";
import { useGetAdminAnalyticsQuery, useGetAdminLiveQuery } from "@/api-services/admin.service";
import { AdminAnalytics, AdminLive, Bucket, Granularity, MetricKey } from "@/models/admin.model";
import { formatNumber, formatReading, formatTime, relativeTime, todayKey } from "./format";
import { FIRST_DAY, formatRange, rangeQuery, readRange } from "./range";
import { useUrlState } from "./useUrlState";
import { DateRangePicker } from "./kit/DateRangePicker";
import { Segmented } from "./kit/Menus";
import { Sparkline } from "./charts/base";
import { TrendChart } from "./charts/TrendChart";
import { BarList, ChangeBadge, CohortTable, Funnel, ScoreBars, WeekHeatmap, busiestSlot, pct } from "./charts/Panels";
import { Avatar, ErrorState, LoadingBlock, PageHeader, TypeChip } from "./ui";

const LIVE_POLL_MS = 20_000;

const naira = (v: number) => `₦${Math.round(v).toLocaleString("en-GB")}`;
const dollars = (v: number) => `$${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cal = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...o });
const asDate = (day: string) => new Date(`${day}T12:00:00Z`);
const dayMonth = (day: string) => cal({ day: "numeric", month: "short" }).format(asDate(day));

/** Axis label and tooltip title for each chart point. */
const bucketText = (b: Bucket, g: Granularity) => {
  if (g === "day")
    return { label: dayMonth(b.start), title: cal({ weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(asDate(b.start)) };
  if (g === "week")
    return { label: dayMonth(b.start), title: b.start === b.end ? dayMonth(b.start) : formatRange({ from: b.start, to: b.end }) };
  const whole = b.start.endsWith("-01");
  return {
    label: cal({ month: "short", year: "2-digit" }).format(asDate(b.start)),
    title: whole ? cal({ month: "long", year: "numeric" }).format(asDate(b.start)) : formatRange({ from: b.start, to: b.end }),
  };
};

interface MetricDef {
  key: MetricKey;
  label: string;
  /** What exactly is counted. */
  help: string;
  format: (v: number) => string;
  note: (a: AdminAnalytics) => ReactNode;
}

const METRICS: MetricDef[] = [
  {
    key: "active",
    label: "Active students",
    help: "People who uploaded, made or took a test, chatted, read in Easy Read, paid or signed in. Signing up alone doesn't count.",
    format: formatNumber,
    note: (a) => `${formatNumber(a.extras.averageDailyActive)} on an average day`,
  },
  {
    key: "signUps",
    label: "New sign-ups",
    help: "New accounts (guest accounts not included).",
    format: formatNumber,
    note: (a) =>
      a.extras.signUps
        ? `${pct((a.extras.googleSignUps / a.extras.signUps) * 100)} with Google · ${formatNumber(a.extras.guests)} guests`
        : `${formatNumber(a.extras.guests)} guests`,
  },
  {
    key: "reading",
    label: "Easy Read time",
    help: "Time spent reading in Easy Read, on every plan, while the reader is open, on screen and in use (it pauses after 5 idle minutes). Students never see this figure.",
    format: formatReading,
    note: (a) =>
      a.easyRead.readers
        ? `${formatNumber(a.easyRead.readers)} ${a.easyRead.readers === 1 ? "reader" : "readers"} · ${formatReading(
            a.metrics.reading.total / a.easyRead.readers
          )} each`
        : a.easyRead.since
          ? "Nobody read in this range"
          : "Recording starts with this release",
  },
  {
    key: "testsFinished",
    label: "Tests finished",
    help: "Tests taken to the end and scored.",
    format: formatNumber,
    note: (a) =>
      `${formatNumber(a.metrics.testsMade.total)} made${
        a.extras.averageScore !== null ? ` · average ${Math.round(a.extras.averageScore)}%` : ""
      }`,
  },
  {
    key: "uploads",
    label: "Uploads",
    help: "Documents students uploaded to study from.",
    format: formatNumber,
    note: (a) => `${formatNumber(a.metrics.chats.total)} chat questions asked`,
  },
  {
    key: "revenue",
    label: "Revenue",
    help: "Successful payments in naira from Paystack, renewals included. Dollar payments are shown beside it, not converted.",
    format: naira,
    note: (a) =>
      a.extras.revenueAvailable
        ? `${formatNumber(a.metrics.payments.total)} ${a.metrics.payments.total === 1 ? "payment" : "payments"}${
            a.metrics.revenueUsd.total ? ` · plus ${dollars(a.metrics.revenueUsd.total)}` : ""
          }`
        : "Paystack didn't answer. Try again shortly.",
  },
];

/* ---------- Pieces ---------- */

const HelpTip: FC<{ text: string }> = ({ text }) => (
  <span className="group/tip relative inline-flex">
    <button
      type="button"
      aria-label={text}
      onClick={(e) => e.stopPropagation()}
      className="grid h-5 w-5 place-items-center rounded-full text-muted hover:text-ink"
    >
      <Info size={13} strokeWidth={2} aria-hidden="true" />
    </button>
    <span
      role="presentation"
      className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 hidden w-60 -translate-x-1/2 rounded-[10px] bg-inverse px-3 py-2 text-left text-[12px] font-medium leading-snug text-on-inverse shadow-lift group-focus-within/tip:block group-hover/tip:block"
    >
      {text}
    </span>
  </span>
);

const Panel: FC<{
  title: string;
  insight?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
  id: string;
}> = ({ title, insight, action, className, children, id }) => (
  <section aria-labelledby={id} className={cn("flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5", className)}>
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
      <div className="mr-auto flex min-w-0 flex-col gap-0.5">
        <h2 id={id} className="text-[15px] font-bold text-ink">
          {title}
        </h2>
        {insight && <p className="text-[13px] leading-snug text-subtle">{insight}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const LiveDot: FC<{ on: boolean }> = ({ on }) => (
  <span aria-hidden="true" className="relative grid h-2.5 w-2.5 place-items-center">
    {on && <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-success opacity-40 motion-reduce:hidden" />}
    <span className={cn("relative h-2 w-2 rounded-full", on ? "bg-success" : "bg-control-strong")} />
  </span>
);

const KpiTabs: FC<{
  data: AdminAnalytics;
  selected: MetricKey;
  compare: boolean;
  partialLast: boolean;
  onSelect: (k: MetricKey) => void;
  panelId: string;
}> = ({ data, selected, compare, partialLast, onSelect, panelId }) => (
  <div role="tablist" aria-label="Measures" className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
    {METRICS.map((m) => {
      const metric = data.metrics[m.key];
      const on = m.key === selected;
      const unknown =
        (m.key === "revenue" && !data.extras.revenueAvailable) || (m.key === "reading" && !data.easyRead.since);
      return (
        <div
          key={m.key}
          className={cn(
            "relative flex min-w-0 flex-col rounded-2xl border bg-surface transition-colors",
            on ? "border-ink" : "border-line hover:border-control"
          )}
        >
          <button
            type="button"
            role="tab"
            id={`tab-${m.key}`}
            aria-selected={on}
            aria-controls={panelId}
            onClick={() => onSelect(m.key)}
            className="flex min-w-0 flex-col gap-1 rounded-2xl px-4 pb-3 pt-3.5 text-left"
          >
            <span className="truncate pr-6 text-[12.5px] font-semibold text-subtle">{m.label}</span>
            <span className="truncate text-[26px] font-bold leading-tight tracking-[-0.03em] text-ink tabular-nums">
              {unknown ? "–" : m.format(metric.total)}
            </span>
            {compare && !unknown ? (
              <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
                <ChangeBadge current={metric.total} previous={metric.previous} />
                <span className="truncate tabular-nums">from {m.format(metric.previous)}</span>
              </span>
            ) : null}
            <span className="min-h-[18px] truncate text-[12px] text-muted">{m.note(data)}</span>
            <span className={cn("mt-1.5", on ? "text-[var(--viz-primary)]" : "text-[var(--viz-prev)]")}>
              <Sparkline values={metric.series} partialLast={partialLast} />
            </span>
          </button>
          <span className="absolute right-2.5 top-3">
            <HelpTip text={m.help} />
          </span>
        </div>
      );
    })}
  </div>
);

const LivePanel: FC<{ live: AdminLive | undefined; now: Date }> = ({ live, now }) => (
  <Panel
    id="live-h"
    title="Right now"
    insight={
      live ? (
        <>
          <b className="font-semibold text-ink">{formatNumber(live.activeToday)}</b> active today ·{" "}
          <b className="font-semibold text-ink">{formatNumber(live.signUpsToday)}</b> new sign-ups today
        </>
      ) : (
        "Loading…"
      )
    }
    action={
      <span className="inline-flex h-7 items-center gap-2 rounded-full bg-hover px-2.5 text-[12px] font-bold text-ink">
        <LiveDot on={!!live?.onlineNow} />
        {formatNumber(live?.onlineNow ?? 0)} online
      </span>
    }
    className="xl:col-span-5"
  >
    {!live ? null : live.online.length === 0 ? (
      <p className="rounded-xl bg-well px-4 py-5 text-[13px] text-subtle">
        Nobody is using the app right now. People show up here within a minute of doing something.
      </p>
    ) : (
      <ul className="-my-1 flex max-h-[300px] flex-col overflow-y-auto">
        {live.online.map((u) => (
          <li key={u.userId}>
            <Link
              href={`/admin/users/${u.userId}`}
              className="-mx-2 flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-hover"
            >
              <Avatar initials={u.initials} seed={u.userId} size={32} online />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-semibold text-ink">{u.name}</span>
                <span className="truncate text-[12px] text-subtle">{u.doing ?? "Online"}</span>
              </span>
              <span className="whitespace-nowrap font-mono text-[11px] text-muted">since {formatTime(u.since)}</span>
            </Link>
          </li>
        ))}
      </ul>
    )}
    {live && live.feed.length > 0 && (
      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <div className="flex items-center">
          <h3 className="mr-auto text-[13px] font-bold text-ink">Latest</h3>
          <Link href="/admin/activity" className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent hover:text-accent-900">
            Activity log <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <ul className="flex flex-col">
          {live.feed.slice(0, 6).map((e) => (
            <li key={e.id} className="flex items-start gap-2.5 py-1.5">
              <TypeChip type={e.type} className="mt-px" />
              <p className="min-w-0 flex-1 text-[12.5px] leading-[1.45] text-body">
                <Link href={`/admin/users/${e.userId}`} className="font-semibold text-ink hover:text-accent">
                  {e.userName}
                </Link>{" "}
                {e.detail}
              </p>
              <span className="whitespace-nowrap font-mono text-[11px] text-muted">{relativeTime(e.createdOn, now)}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </Panel>
);

const EasyReadPanel: FC<{ data: AdminAnalytics; compare: boolean }> = ({ data, compare }) => {
  const er = data.easyRead;
  const total = data.metrics.reading.total;
  const previous = data.metrics.reading.previous;
  const perReader = er.readers ? total / er.readers : 0;
  const perSession = er.sessions ? total / er.sessions : 0;
  const stats: { label: string; value: string; current: number; previous: number }[] = [
    { label: "Reading time", value: formatReading(total), current: total, previous },
    { label: "Readers", value: formatNumber(er.readers), current: er.readers, previous: er.previousReaders },
    {
      label: "Per reader",
      value: formatReading(perReader),
      current: perReader,
      previous: er.previousReaders ? previous / er.previousReaders : 0,
    },
    {
      label: "Per session",
      value: formatReading(perSession),
      current: perSession,
      previous: er.previousSessions ? previous / er.previousSessions : 0,
    },
  ];
  const insight = !er.since
    ? "Reading time starts recording with this release, for every plan. Students never see it."
    : total
      ? `Students read for ${formatReading(total)} ${
          data.range.from === data.range.to ? "that day" : "in this range"
        }, about ${formatReading(perSession)} at a sitting.`
      : `Nobody read in Easy Read in this range. Recording started on ${formatRange({ from: er.since, to: er.since })}.`;

  return (
    <Panel id="er-h" title="Easy Read" insight={insight} className="xl:col-span-7">
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="flex flex-col gap-0.5 rounded-xl bg-well px-3.5 py-3">
            <dt className="text-[12px] font-semibold text-subtle">{st.label}</dt>
            <dd className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-[20px] font-bold tracking-[-0.02em] text-ink tabular-nums">{st.value}</span>
              {compare && er.since && <ChangeBadge current={st.current} previous={st.previous} />}
            </dd>
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="text-[13px] font-bold text-ink">Read the longest</h3>
          {er.documents.length ? (
            <BarList
              format={formatReading}
              rows={er.documents.map((d) => ({
                key: d.documentId,
                value: d.seconds,
                label: (
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate">{d.title}</span>
                    <span className="shrink-0 text-[12px] font-normal text-muted">
                      {formatNumber(d.readers)} {d.readers === 1 ? "reader" : "readers"}
                    </span>
                  </span>
                ),
              }))}
            />
          ) : (
            <p className="rounded-xl bg-well px-3.5 py-4 text-[13px] text-subtle">No documents read yet.</p>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="text-[13px] font-bold text-ink">Top readers</h3>
          {er.topReaders.length ? (
            <BarList
              format={formatReading}
              rows={er.topReaders.map((r) => ({
                key: r.userId,
                href: `/admin/users/${r.userId}`,
                value: r.seconds,
                label: (
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar initials={r.initials} seed={r.userId} size={22} />
                    <span className="truncate">{r.name}</span>
                    <span className="hidden shrink-0 text-[12px] font-normal text-muted sm:inline">
                      {formatNumber(r.days)} {r.days === 1 ? "day" : "days"}
                    </span>
                  </span>
                ),
              }))}
            />
          ) : (
            <p className="rounded-xl bg-well px-3.5 py-4 text-[13px] text-subtle">No readers yet.</p>
          )}
        </div>
      </div>
    </Panel>
  );
};

/* ---------- Page ---------- */

/** Admin home: a date range, the measures that matter with the period before, and what's happening now. */
const OverviewView: FC = () => {
  const url = useUrlState();
  const today = todayKey();
  const range = readRange(url.query, "30d", today);
  const metricKey = (METRICS.find((m) => m.key === url.get("metric"))?.key ?? "active") as MetricKey;
  const granularity = url.get("g") as Granularity | undefined;
  const compareOn = url.get("compare") !== "off";

  const { data, isLoading, isFetching, isError, refetch } = useGetAdminAnalyticsQuery(
    { from: range.from, to: range.to, granularity },
    { skip: !url.ready, refetchOnMountOrArgChange: 60 }
  );
  const { data: live, fulfilledTimeStamp } = useGetAdminLiveQuery(undefined, {
    pollingInterval: LIVE_POLL_MS,
    skipPollingIfUnfocused: true,
    refetchOnMountOrArgChange: true,
  });
  const now = useMemo(
    () => (live?.generatedAt ? new Date(live.generatedAt) : new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [live?.generatedAt, fulfilledTimeStamp]
  );

  const canCompare = !!data && data.previous.to >= FIRST_DAY;
  const compare = compareOn && canCompare;
  const partialLast = !!data && data.range.to === today;
  const def = METRICS.find((m) => m.key === metricKey)!;
  const metric = data?.metrics[metricKey];

  const points = data ? data.buckets.map((b) => bucketText(b, data.granularity)) : [];
  const prevPoints = data ? data.previousBuckets.map((b) => bucketText(b, data.granularity)) : [];

  // Runs where nothing at all was recorded (an outage or lost data), shaded on the chart.
  const gaps = useMemo(() => {
    if (!data) return [];
    const quiet = data.buckets.map((_, i) =>
      (["active", "signUps", "uploads", "testsMade", "testsFinished", "chats"] as MetricKey[]).every(
        (k) => !data.metrics[k].series[i]
      )
    );
    const minRun = data.granularity === "day" ? 3 : 1;
    const runs: { from: number; to: number }[] = [];
    quiet.forEach((q, i) => {
      if (!q) return;
      const last = runs[runs.length - 1];
      if (last && last.to === i - 1) last.to = i;
      else runs.push({ from: i, to: i });
    });
    return runs.filter((r) => r.to - r.from + 1 >= minRun);
  }, [data]);
  const funnel = data?.funnel ?? [];
  const signUps = funnel[0]?.count ?? 0;
  const busiest = data ? busiestSlot(data.heatmap) : null;
  // Weeks nobody signed up in (this week, so far) say nothing.
  const cohorts = data?.cohorts.filter((c) => c.size > 0) ?? [];
  const secondWeek = cohorts.filter((c) => c.weeks[1] !== null);
  const secondWeekShare = secondWeek.length
    ? (secondWeek.reduce((a, c) => a + (c.weeks[1] ?? 0), 0) / secondWeek.reduce((a, c) => a + c.size, 0)) * 100
    : null;
  const topFeature = data ? [...data.features].sort((a, b) => b.count - a.count)[0] : null;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={
          data
            ? `${formatRange(data.range)}${compare ? ` compared with ${formatRange(data.previous)}` : ""} · Lagos time`
            : " "
        }
        actions={
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-[12.5px] font-semibold text-ink">
            <LiveDot on={!!live} />
            {live ? `Live · ${formatTime(live.generatedAt)}` : "Connecting…"}
          </span>
        }
      />

      {/* Filters: one row above everything they scope. */}
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-2.5 border-b border-line bg-canvas px-4 py-3 md:top-0 md:-mx-9 md:px-9">
        <DateRangePicker
          label="Date range"
          value={range}
          stepper
          onChange={(r) => r && url.set({ ...rangeQuery(r, today), g: undefined })}
          className="min-w-0 max-w-full"
        />
        <button
          type="button"
          aria-pressed={compare}
          disabled={!canCompare}
          onClick={() => url.set({ compare: compareOn ? "off" : undefined })}
          className={cn(
            "flex h-10 items-center gap-2 rounded-[10px] border px-3 text-[13px] font-semibold transition-colors disabled:opacity-40",
            compare ? "border-control-strong bg-surface text-ink" : "border-control bg-surface text-subtle hover:text-ink"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "relative h-4 w-7 rounded-full transition-colors",
              compare ? "bg-ink" : "bg-control"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-3 w-3 rounded-full bg-surface transition-[left]",
                compare ? "left-[14px]" : "left-0.5"
              )}
            />
          </span>
          Compare with previous period
        </button>
        {isFetching && !isLoading && (
          <span role="status" className="text-[12px] font-medium text-muted">
            Updating…
          </span>
        )}
      </div>

      {isLoading || (!data && !isError) ? (
        <LoadingBlock label="Loading the overview" />
      ) : !data ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", isFetching && "opacity-60")} aria-busy={isFetching}>
          <KpiTabs
            data={data}
            selected={metricKey}
            compare={compare}
            partialLast={partialLast}
            onSelect={(k) => url.set({ metric: k === "active" ? undefined : k })}
            panelId="trend-panel"
          />

          <section
            id="trend-panel"
            role="tabpanel"
            aria-labelledby={`tab-${metricKey}`}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="mr-auto flex min-w-0 flex-col">
                <h2 className="text-[15px] font-bold text-ink">{def.label}</h2>
                <p className="text-[13px] text-subtle">
                  {data.granularity === "day" ? "Per day" : data.granularity === "week" ? "Per 7 days" : "Per month"}
                  {partialLast ? " · today is still going" : ""}
                  {gaps.length > 0 && (
                    <>
                      {" · "}
                      <span className="text-ink">
                        nothing was recorded {gaps.map((g) => (g.from === g.to ? points[g.from].title : `${points[g.from].label} – ${points[g.to].label}`)).join(", ")}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-0.5 w-4 rounded bg-[var(--viz-primary)]" />
                  {formatRange(data.range)}
                </span>
                {compare && (
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className="w-4 border-t-2 border-dashed border-[var(--viz-prev)]" />
                    {formatRange(data.previous)}
                  </span>
                )}
              </div>
              {data.granularities.length > 1 && (
                <Segmented
                  label="Each point is"
                  value={data.granularity}
                  options={(["day", "week", "month"] as Granularity[])
                    .filter((g) => data.granularities.includes(g))
                    .map((g) => ({ value: g, label: g === "day" ? "Day" : g === "week" ? "Week" : "Month" }))}
                  onChange={(g) => url.set({ g })}
                />
              )}
            </div>
            {metric && (
              <TrendChart
                name={def.label}
                labels={points.map((p) => p.label)}
                titles={points.map((p) => p.title)}
                values={metric.series}
                previous={compare ? metric.previousSeries : undefined}
                previousTitles={prevPoints.map((p) => p.title)}
                format={def.format}
                partialLast={partialLast}
                gaps={gaps}
              />
            )}
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <EasyReadPanel data={data} compare={compare} />
            <LivePanel live={live} now={now} />
            <Panel
              id="funnel-h"
              title="From sign-up to paying"
              insight={
                signUps
                  ? `Of ${formatNumber(signUps)} people who signed up ${
                      data.range.from === data.range.to ? "that day" : "in this range"
                    }, ${pct((funnel[1].count / signUps) * 100)} uploaded a document and ${pct(
                      (funnel[3].count / signUps) * 100
                    )} finished a test.`
                  : "Nobody signed up in this range."
              }
              className="xl:col-span-7"
            >
              <Funnel steps={funnel} />
            </Panel>
            <Panel
              id="features-h"
              title="What they use"
              insight={topFeature?.count ? `${topFeature.label} lead this range.` : "Nothing used in this range."}
              className="xl:col-span-5"
            >
              <BarList
                compare={compare}
                rows={[...data.features]
                  .sort((a, b) => b.count - a.count)
                  .map((f) => ({ key: f.key, label: f.label, value: f.count, previous: f.previous }))}
              />
            </Panel>
            <Panel
              id="cohort-h"
              title="Do new students come back?"
              insight={
                cohorts.length
                  ? secondWeekShare !== null
                    ? `On average ${pct(secondWeekShare)} used the app again in their second week.`
                    : "Too early to tell: the second week hasn't started yet."
                  : "Pick a range that includes a Monday to see sign-up weeks."
              }
              className="xl:col-span-7"
            >
              {cohorts.length > 0 && <CohortTable cohorts={cohorts} weekLabel={(w) => dayMonth(w)} />}
              <p className="text-[12px] text-muted">
                Each row is a week of sign-ups. A cell shows the share who did something in that week after signing up.
              </p>
            </Panel>
            <Panel
              id="scores-h"
              title="Test scores"
              insight={
                data.scores.count
                  ? `Average ${Math.round(data.extras.averageScore ?? 0)}% · ${pct(data.extras.passRate ?? 0)} scored 50% or more.`
                  : "No finished tests in this range."
              }
              className="xl:col-span-5"
            >
              <ScoreBars buckets={data.scores.buckets} average={data.extras.averageScore} />
            </Panel>
            <Panel
              id="heat-h"
              title="When students study"
              insight={busiest ? `Busiest on ${busiest.day}s, and around ${busiest.hour} on any day (Lagos time).` : "No activity in this range."}
              className="xl:col-span-7"
            >
              <WeekHeatmap grid={data.heatmap} />
              <p className="text-[12px] text-muted">
                Each square adds up the students who were studying in that hour (any test, upload, chat or Easy Read
                reading) across the range.
              </p>
            </Panel>
            <Panel
              id="top-h"
              title="Most active students"
              insight="By tests made, uploads, finished tests, chat questions and documents read in Easy Read."
              action={
                <Link href="/admin/users?sort=last_active" className="text-[12px] font-semibold text-accent hover:text-accent-900">
                  All users
                </Link>
              }
              className="xl:col-span-5"
            >
              {data.topStudents.length === 0 ? (
                <p className="text-[13px] text-muted">Nobody did anything in this range.</p>
              ) : (
                <BarList
                  rows={data.topStudents.map((t) => ({
                    key: t.userId,
                    href: `/admin/users/${t.userId}`,
                    value: t.actions,
                    label: (
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Avatar initials={t.initials} seed={t.userId} size={22} />
                        <span className="truncate">{t.name}</span>
                        <span className="hidden truncate text-[12px] font-normal text-muted sm:inline xl:hidden 2xl:inline">
                          {[
                            t.tests && `${formatNumber(t.tests)} tests`,
                            t.finished && `${formatNumber(t.finished)} finished`,
                            t.uploads && `${formatNumber(t.uploads)} uploads`,
                            t.chats && `${formatNumber(t.chats)} chats`,
                            t.readingSeconds && `${formatReading(t.readingSeconds)} reading`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    ),
                  }))}
                />
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
};

export default OverviewView;
