import React, { FC, MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { Flag, ListChecks } from "lucide-react";
import { useGetTestsQuery, useGetTestsSummaryQuery } from "@/api-services/admin.service";
import { formatDayAndTime, formatNumber, todayKey } from "../format";
import { rangePhrase, rangeQuery, readRange } from "../range";
import { useUrlState } from "../useUrlState";
import { DateRangePicker } from "../kit/DateRangePicker";
import { FilterTokens, SelectMenu } from "../kit/Menus";
import { Pagination } from "../kit/Pagination";
import { PersonSearch } from "../kit/PersonSearch";
import { useNarrow } from "../kit/Popover";
import { BarList, pct } from "../charts/Panels";
import { Avatar, EmptyState, ErrorState, LoadingBlock, PageHeader, buttonClass } from "../ui";
import { MOODS, MOOD_ORDER, STOP_REASONS, TEST_ISSUES } from "./insightsText";
import { MoodBar, MoodChip, MoodLegend } from "./insightsUi";
import { TestAttemptPane } from "./TestAttemptView";

const SIZES = [25, 50, 100];
const TYPES = [
  { value: "", label: "Any type" },
  { value: "3", label: "Multiple choice" },
  { value: "5", label: "True/false" },
  { value: "4", label: "Flashcards" },
  { value: "7", label: "Essay" },
];

const Panel: FC<{ title: string; note?: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, note, className, children }) => (
  <section className={cn("flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-5", className)}>
    <div className="flex flex-col gap-0.5">
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      {note && <p className="text-[13px] leading-snug text-subtle">{note}</p>}
    </div>
    {children}
  </section>
);

/** How students get on with their practice tests: conversion, drop-off, problems, topics, attempts. */
const TestsView: FC = () => {
  const url = useUrlState();
  const today = todayKey();
  const range = readRange(url.query, "30d", today);
  const type = url.get("type") ?? "";
  const status = url.get("status") ?? "";
  const mood = url.get("mood") ?? "";
  const search = url.get("q") ?? "";
  const userId = url.get("person");
  const personName = url.get("personName");
  const pageSize = SIZES.includes(Number(url.get("size"))) ? Number(url.get("size")) : 25;
  const page = Math.max(1, Number(url.get("page")) || 1);
  const view: "attempts" | "summary" = url.get("view") === "summary" ? "summary" : "attempts";
  // Wide screens read attempts in a pane beside the list; narrower ones open a page.
  const split = !useNarrow(1280);
  const openKey = split ? url.get("open") : undefined;
  const bar = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const summary = useGetTestsSummaryQuery({ from: range.from, to: range.to }, { skip: !url.ready, refetchOnMountOrArgChange: 60 });
  const { data, isLoading, isFetching, isError, refetch } = useGetTestsQuery(
    { from: range.from, to: range.to, type: type || undefined, status: status || undefined, mood: mood || undefined, search: userId ? undefined : search || undefined, userId, page, pageSize },
    { skip: !url.ready, refetchOnMountOrArgChange: 30 }
  );
  const setFilters = (patch: Record<string, string | undefined>) => url.set({ ...patch, page: undefined, open: undefined });
  const items = data?.items ?? [];
  const index = openKey ? items.findIndex((a) => a.key === openKey) : -1;
  const openRow = (key: string | undefined) => url.set({ open: key });
  const prev = index > 0 ? () => openRow(items[index - 1].key) : undefined;
  const next = index >= 0 && index < items.length - 1 ? () => openRow(items[index + 1].key) : undefined;

  // J and K move through the attempts while reading.
  useEffect(() => {
    if (!split || view !== "attempts") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, [contenteditable], [role='dialog'], [role='listbox']")) return;
      if (e.key === "j") (next ?? (index === -1 && items[0] ? () => openRow(items[0].key) : undefined))?.();
      if (e.key === "k") prev?.();
      if (e.key === "Escape" && openKey) openRow(undefined);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  const paneStyle = { top: barH + 20, height: `calc(100dvh - ${barH + 40}px)` };
  const clearAll = () => setFilters({ type: undefined, status: undefined, mood: undefined, q: undefined, person: undefined, personName: undefined });

  const s = summary.data;
  const stopsMax = Math.max(1, ...(s?.stops ?? [0]));
  const totalStopped = s?.attempts.stopped ?? 0;
  const early = s ? s.stops.slice(0, 3).reduce((a, b) => a + b, 0) : 0;
  const tokens = [
    ...(userId ? [{ key: "p", label: <>Student is <b className="font-semibold text-ink">{personName ?? "one person"}</b></>, onRemove: () => setFilters({ person: undefined, personName: undefined }) }] : search ? [{ key: "q", label: <>Student matches <b className="font-semibold text-ink">“{search}”</b></>, onRemove: () => setFilters({ q: undefined }) }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Tests"
        subtitle={
          s
            ? `${formatNumber(s.byType.reduce((a, t) => a + t.made, 0))} tests made ${rangePhrase(range, today)} · ${formatNumber(
                s.attempts.finished
              )} attempts finished, ${formatNumber(s.attempts.stopped)} stopped part-way`
            : " "
        }
      />

      <div role="tablist" aria-label="Tests" className="-mx-4 -mb-2 flex gap-1 border-b border-line px-4 md:mx-0 md:px-0">
        {(
          [
            { key: "attempts", label: "Attempts", n: data?.total },
            { key: "summary", label: "Summary", n: undefined },
          ] as const
        ).map((t) => {
          const on = t.key === view;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => url.set({ view: t.key === "attempts" ? undefined : t.key, open: undefined })}
              className={cn(
                "-mb-px inline-flex h-[42px] items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 text-sm transition-colors",
                on ? "border-ink font-bold text-ink" : "border-transparent font-medium text-subtle hover:text-ink"
              )}
            >
              {t.label}
              {t.n !== undefined && <span className="font-medium text-muted tabular-nums">{formatNumber(t.n)}</span>}
            </button>
          );
        })}
      </div>

      <div ref={bar} className="sticky top-14 z-20 -mx-4 flex flex-col gap-2.5 border-b border-line bg-canvas px-4 py-3 md:top-0 md:-mx-9 md:px-9">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangePicker label="Date range" value={range} stepper onChange={(r) => r && setFilters(rangeQuery(r, today))} />
          {view === "attempts" && (
          <>
          <PersonSearch
            value={search}
            placeholder="Search students"
            onChange={(q) => setFilters({ q: q || undefined, person: undefined, personName: undefined })}
            onPick={(p) => setFilters({ person: p.id, personName: p.name, q: undefined })}
            className="w-full sm:w-[220px]"
          />
          <SelectMenu label="Type" value={type} placeholder options={TYPES} onChange={(v) => setFilters({ type: v || undefined })} />
          <SelectMenu
            label="Status"
            value={status}
            placeholder
            options={[
              { value: "", label: "Any" },
              { value: "finished", label: "Finished" },
              { value: "stopped", label: "Stopped part-way" },
            ]}
            onChange={(v) => setFilters({ status: v || undefined })}
          />
          <SelectMenu
            label="Mood"
            value={mood}
            placeholder
            options={[{ value: "", label: "Any" }, ...MOOD_ORDER.map((m) => ({ value: m, label: MOODS[m].label, swatch: MOODS[m].color }))]}
            onChange={(v) => setFilters({ mood: v || undefined })}
          />
          </>
          )}
        </div>
        <FilterTokens tokens={tokens} onClearAll={clearAll} />
      </div>

      {view !== "summary" ? null : summary.isLoading || !s ? (
        summary.isError ? <ErrorState onRetry={summary.refetch} /> : <LoadingBlock label="Loading the test summary" />
      ) : (
        <div className={cn("grid grid-cols-1 gap-4 transition-opacity xl:grid-cols-12", summary.isFetching && "opacity-60")}>
          <Panel
            title="From made to finished"
            note="Of the tests made in this range, how many were started and how many finished."
            className="xl:col-span-7"
          >
            <ul className="flex flex-col gap-3">
              {s.byType.map((t) => (
                <li key={t.typeId} className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 text-[13px]">
                    <span className="font-semibold text-ink">{t.type}</span>
                    <span className="text-muted tabular-nums">{formatNumber(t.made)} made</span>
                    <span className="ml-auto font-mono text-[12px] text-subtle">
                      {t.typeId === 4 || t.typeId === 7 || t.typeId === 6
                        ? "progress not recorded"
                        : `${pct((t.started / Math.max(1, t.made)) * 100)} started · ${pct((t.finished / Math.max(1, t.made)) * 100)} finished`}
                    </span>
                  </div>
                  <div aria-hidden="true" className="relative h-2.5 overflow-hidden rounded-[4px] bg-hover">
                    <div className="absolute inset-y-0 left-0 rounded-[4px] bg-[var(--viz-primary)] opacity-30" style={{ width: `${(t.started / Math.max(1, t.made)) * 100}%` }} />
                    <div className="absolute inset-y-0 left-0 rounded-[4px] bg-[var(--viz-primary)]" style={{ width: `${(t.finished / Math.max(1, t.made)) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Where unfinished tests stop"
            note={
              totalStopped
                ? `${pct((early / totalStopped) * 100)} of the ${formatNumber(totalStopped)} unfinished attempts stopped in the first 30% of the test.`
                : "No unfinished attempts in this range."
            }
            className="xl:col-span-5"
          >
            <div className="flex h-[120px] items-end gap-1.5 border-b border-[var(--viz-axis)]">
              {s.stops.map((n, i) => (
                <div key={i} className="group relative flex h-full flex-1 items-end" title={`${n} stopped ${i * 10}–${i * 10 + 10}% of the way through`}>
                  <div className="w-full rounded-t-[4px] bg-[var(--viz-primary)]" style={{ height: `${n ? Math.max(3, (n / stopsMax) * 100) : 0}%`, opacity: 0.4 + (1 - i / 10) * 0.6 }} />
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="flex justify-between font-mono text-[10.5px] text-muted">
              <span>start</span>
              <span>half-way</span>
              <span>nearly done</span>
            </div>
          </Panel>

          <Panel
            title="What Claude saw in the attempts"
            note={
              s.labelled
                ? `From ${formatNumber(s.labelled)} labelled attempts. Each can have more than one problem.`
                : "Nothing labelled in this range yet."
            }
            className="xl:col-span-7"
          >
            {s.labelled > 0 && (
              <div className="flex flex-col gap-2">
                <MoodBar moods={s.moods} height={10} />
                <MoodLegend moods={s.moods} />
              </div>
            )}
            <BarList
              rows={s.issues.map((i) => ({ key: i.key, label: TEST_ISSUES[i.key] ?? i.key, value: i.count }))}
            />
            {s.stopReasons.length > 0 && (
              <p className="text-[12.5px] text-subtle">
                <b className="font-semibold text-body">Why people stopped: </b>
                {s.stopReasons.map((r) => `${STOP_REASONS[r.key] ?? r.key} (${formatNumber(r.count)})`).join(" · ")}
              </p>
            )}
          </Panel>

          <Panel title="Topics students miss" note="The topics Claude saw students get wrong most often." className="xl:col-span-5">
            {s.struggles.length ? (
              <BarList rows={s.struggles.map((t) => ({ key: t.key, label: t.key, value: t.count }))} />
            ) : (
              <p className="text-[13px] text-muted">Nothing yet.</p>
            )}
          </Panel>

          {s.flagged.length > 0 && (
            <Panel title="Questions students reported" note="Students marked these as wrong or unclear while taking the test." className="xl:col-span-12">
              <ul className="divide-y divide-line">
                {s.flagged.map((f, i) => (
                  <li key={`${f.testId}-${i}`} className="flex gap-3 py-2.5">
                    <Flag size={15} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="text-[13.5px] text-ink">
                        <span className="font-mono text-[12px] text-muted">Q{f.number} · </span>
                        {f.question}
                      </p>
                      <p className="text-[12px] text-muted">
                        {f.topic && `${f.topic} · `}
                        {f.student.name} · {f.documentTitle}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-muted">{formatDayAndTime(f.at)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}

      {view === "attempts" && (
        <div className={cn("grid grid-cols-1 items-start gap-5", split && "xl:grid-cols-[minmax(380px,440px)_minmax(0,1fr)]")}>
          <section aria-label="Attempts" className={cn("min-w-0 overflow-hidden rounded-2xl border border-line bg-surface transition-opacity", isFetching && !isLoading && "opacity-60")}>
            {isLoading || (!data && !isError) ? (
              <LoadingBlock label="Loading attempts" />
            ) : !data ? (
              <ErrorState onRetry={refetch} />
            ) : data.items.length === 0 ? (
              <EmptyState title="No attempts here">
                Nothing matches {rangePhrase(range, today)}.{" "}
                <button type="button" onClick={clearAll} className={buttonClass.link}>
                  Clear the filters
                </button>
              </EmptyState>
            ) : (
              <>
                <ul className="divide-y divide-line">
                  {data.items.map((a) => {
                    const done = Math.min(100, (a.answered / Math.max(1, a.total)) * 100);
                    const on = a.key === openKey;
                    const labelled = a.label?.status === "done";
                    const onClick = (e: MouseEvent) => {
                      if (!split || e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      openRow(on ? undefined : a.key);
                    };
                    return (
                      <li key={a.key}>
                        <Link
                          href={`/admin/tests/${a.key}`}
                          onClick={onClick}
                          aria-current={on ? "true" : undefined}
                          className={cn("group flex gap-3 px-4 py-3.5 transition-colors md:px-5", on ? "bg-hover" : "hover:bg-canvas")}
                        >
                          <Avatar initials={a.student.initials} seed={a.student.userId ?? a.key} size={32} className="mt-0.5" />
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex items-baseline gap-2">
                              <span className={cn("truncate text-[14px] text-ink", on ? "font-bold" : "font-semibold")}>{a.student.name}</span>
                              <span className="ml-auto shrink-0 text-[11.5px] text-muted">{formatDayAndTime(a.at)}</span>
                            </span>
                            <span className="truncate text-[12.5px] text-muted">
                              {a.type} on {a.documentTitle}
                            </span>
                            <span className="flex items-center gap-2.5">
                              <span aria-hidden="true" className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-hover">
                                <span className={cn("block h-full rounded-full", a.status === "finished" ? "bg-[var(--viz-primary)]" : "bg-[var(--mood-unclear)]")} style={{ width: `${done}%` }} />
                              </span>
                              <span className="text-[12.5px] text-body tabular-nums">
                                {a.status === "finished" ? "Finished" : `Stopped at ${formatNumber(a.answered)} of ${formatNumber(a.total)}`}
                                {a.score !== null && ` · ${Math.round(a.score)}%`}
                              </span>
                            </span>
                            {labelled && a.label?.summary && <span className="line-clamp-2 text-[13px] leading-snug text-body">{a.label.summary}</span>}
                            <span className="mt-0.5">
                              <MoodChip mood={labelled ? a.label?.mood : null} pending={a.label?.status === "pending"} />
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Pagination
                  page={data.page}
                  pageSize={data.pageSize}
                  total={data.total}
                  noun={data.total === 1 ? "attempt" : "attempts"}
                  busy={isFetching}
                  sizes={SIZES}
                  onPage={(p) => {
                    url.set({ page: p > 1 ? p : undefined, open: undefined });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onPageSize={(sz) => setFilters({ size: sz === 25 ? undefined : String(sz) })}
                />
              </>
            )}
          </section>

          {split &&
            (openKey ? (
              <TestAttemptPane
                key={openKey}
                attemptKey={openKey}
                position={{ index: Math.max(0, index), total: items.length }}
                onPrev={prev}
                onNext={next}
                onClose={() => openRow(undefined)}
                style={paneStyle}
              />
            ) : (
              <div style={paneStyle} className="sticky flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line px-8 text-center">
                <ListChecks size={22} strokeWidth={1.6} aria-hidden="true" className="text-faint" />
                <p className="text-[14px] font-semibold text-ink">Pick an attempt to read it here</p>
                <p className="max-w-[40ch] text-[13px] leading-relaxed text-subtle">
                  You’ll see every question, what the student picked and Claude’s read. Press{" "}
                  <kbd className="rounded border border-line px-1 font-mono text-[11px]">J</kbd> to open the first one, then{" "}
                  <kbd className="rounded border border-line px-1 font-mono text-[11px]">J</kbd> and{" "}
                  <kbd className="rounded border border-line px-1 font-mono text-[11px]">K</kbd> to move.
                </p>
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default TestsView;
