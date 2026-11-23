import React, { FC, MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { MessagesSquare } from "lucide-react";
import { useGetConversationsQuery } from "@/api-services/admin.service";
import { Mood } from "@/models/insights.model";
import { formatDayAndTime, formatNumber, todayKey } from "../format";
import { rangePhrase, rangeQuery, readRange } from "../range";
import { useUrlState } from "../useUrlState";
import { DateRangePicker } from "../kit/DateRangePicker";
import { FilterTokens, SelectMenu } from "../kit/Menus";
import { Pagination } from "../kit/Pagination";
import { PersonSearch } from "../kit/PersonSearch";
import { useNarrow } from "../kit/Popover";
import { Avatar, EmptyState, ErrorState, LoadingBlock, PageHeader, buttonClass } from "../ui";
import { CHAT_ISSUES, MOODS, MOOD_ORDER } from "./insightsText";
import { MoodChip } from "./insightsUi";
import { ConversationPane } from "./ConversationView";

const SIZES = [25, 50, 100];

/** Every chat conversation students had with their documents, with Claude's read on each. */
const ConversationsView: FC = () => {
  const url = useUrlState();
  const today = todayKey();
  const range = readRange(url.query, "30d", today);
  const mood = url.get("mood") ?? "";
  const issue = url.get("issue") ?? "";
  const search = url.get("q") ?? "";
  const userId = url.get("person");
  const personName = url.get("personName");
  const documentId = url.get("document");
  const pageSize = SIZES.includes(Number(url.get("size"))) ? Number(url.get("size")) : 25;
  const page = Math.max(1, Number(url.get("page")) || 1);
  // Wide screens read conversations in a pane beside the list; narrower ones open a page.
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

  const { data, isLoading, isFetching, isError, refetch } = useGetConversationsQuery(
    {
      from: range.from,
      to: range.to,
      mood: mood || undefined,
      issue: issue || undefined,
      search: userId ? undefined : search || undefined,
      userId,
      documentId,
      page,
      pageSize,
    },
    { skip: !url.ready, refetchOnMountOrArgChange: 30 }
  );

  const setFilters = (patch: Record<string, string | undefined>) => url.set({ ...patch, page: undefined, open: undefined });
  const items = data?.items ?? [];
  const index = openKey ? items.findIndex((c) => c.key === openKey) : -1;
  const openRow = (key: string | undefined) => url.set({ open: key });
  const prev = index > 0 ? () => openRow(items[index - 1].key) : undefined;
  const next = index >= 0 && index < items.length - 1 ? () => openRow(items[index + 1].key) : undefined;

  // J and K move through the list while reading.
  useEffect(() => {
    if (!split) return;
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
  const clearAll = () =>
    setFilters({ mood: undefined, issue: undefined, q: undefined, person: undefined, personName: undefined, document: undefined });

  const counts = data?.counts;
  const tokens = [
    ...(userId ? [{ key: "p", label: <>Student is <b className="font-semibold text-ink">{personName ?? "one person"}</b></>, onRemove: () => setFilters({ person: undefined, personName: undefined }) }] : search ? [{ key: "q", label: <>Student matches <b className="font-semibold text-ink">“{search}”</b></>, onRemove: () => setFilters({ q: undefined }) }] : []),
    ...(documentId ? [{ key: "d", label: <>One document</>, onRemove: () => setFilters({ document: undefined }) }] : []),
    ...(issue ? [{ key: "i", label: <>Problem: <b className="font-semibold text-ink">{CHAT_ISSUES[issue] ?? issue}</b></>, onRemove: () => setFilters({ issue: undefined }) }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Conversations"
        subtitle={
          data
            ? `${formatNumber(data.counts.all)} chat ${data.counts.all === 1 ? "conversation" : "conversations"} ${rangePhrase(range, today)} · ${formatNumber(
                data.counts.all - data.counts.unlabelled
              )} labelled by Claude`
            : " "
        }
      />

      <div ref={bar} className="sticky top-14 z-20 -mx-4 flex flex-col gap-2.5 border-b border-line bg-canvas px-4 py-3 md:top-0 md:-mx-9 md:px-9">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangePicker label="Date range" value={range} stepper onChange={(r) => r && setFilters(rangeQuery(r, today))} />
          <PersonSearch
            value={search}
            placeholder="Search students"
            onChange={(q) => setFilters({ q: q || undefined, person: undefined, personName: undefined })}
            onPick={(p) => setFilters({ person: p.id, personName: p.name, q: undefined })}
            className="w-full sm:w-[220px]"
          />
          <SelectMenu
            label="Problem"
            value={issue}
            placeholder
            options={[{ value: "", label: "Any" }, ...Object.entries(CHAT_ISSUES).map(([value, label]) => ({ value, label }))]}
            onChange={(v) => setFilters({ issue: v || undefined })}
          />
        </div>
        {/* Mood: the main way in, as a segmented strip with counts. */}
        <div role="radiogroup" aria-label="Mood" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          {[{ key: "", label: "All", n: counts?.all }, ...MOOD_ORDER.map((m) => ({ key: m, label: MOODS[m].label, n: counts?.[m] })), { key: "unlabelled", label: "Not labelled yet", n: counts?.unlabelled }].map((o) => {
            const on = mood === o.key;
            return (
              <button
                key={o.key || "all"}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setFilters({ mood: o.key || undefined })}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-[12.5px] font-semibold transition-colors",
                  on ? "border-ink bg-ink text-surface" : "border-line bg-surface text-body hover:border-control"
                )}
              >
                {o.key && o.key !== "unlabelled" && (
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: MOODS[o.key as Mood].color }} />
                )}
                {o.label}
                <span className={cn("font-mono text-[11px]", on ? "text-surface/70" : "text-muted")}>{o.n === undefined ? "–" : formatNumber(o.n)}</span>
              </button>
            );
          })}
        </div>
        <FilterTokens tokens={tokens} onClearAll={clearAll} />
      </div>

      <div className={cn("grid grid-cols-1 items-start gap-5", split && "xl:grid-cols-[minmax(380px,440px)_minmax(0,1fr)]")}>
        <div className={cn("min-w-0 overflow-hidden rounded-2xl border border-line bg-surface transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading || (!data && !isError) ? (
            <LoadingBlock label="Loading conversations" />
          ) : !data ? (
            <ErrorState onRetry={refetch} />
          ) : data.items.length === 0 ? (
            <EmptyState title="No conversations here">
              Nothing matches {rangePhrase(range, today)}.{" "}
              {(tokens.length > 0 || mood) && (
                <button type="button" onClick={clearAll} className={buttonClass.link}>
                  Clear the filters
                </button>
              )}
            </EmptyState>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {data.items.map((c) => {
                  const on = c.key === openKey;
                  const labelled = c.label?.status === "done";
                  const onClick = (e: MouseEvent) => {
                    if (!split || e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    openRow(on ? undefined : c.key);
                  };
                  return (
                    <li key={c.key}>
                      {split ? (
                        <Link
                          href={`/admin/conversations/${c.key}`}
                          onClick={onClick}
                          aria-current={on ? "true" : undefined}
                          className={cn("group flex gap-3 px-4 py-3.5 transition-colors", on ? "bg-hover" : "hover:bg-canvas")}
                        >
                          <Avatar initials={c.student.initials} seed={c.student.userId ?? c.key} size={32} className="mt-0.5" />
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex items-baseline gap-2">
                              <span className={cn("truncate text-[14px] text-ink", on ? "font-bold" : "font-semibold")}>{c.student.name}</span>
                              <span className="ml-auto shrink-0 text-[11.5px] text-muted">{formatDayAndTime(c.startedOn)}</span>
                            </span>
                            <span className="truncate text-[12.5px] text-muted">{c.documentTitle}</span>
                            <span className="line-clamp-2 text-[13px] leading-snug text-body">
                              {labelled && c.label?.summary ? c.label.summary : `“${c.preview.trim() || "…"}”`}
                            </span>
                            <span className="mt-0.5 flex items-center gap-2.5">
                              <MoodChip mood={labelled ? c.label?.mood : null} pending={c.label?.status === "pending"} />
                              <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                                <MessagesSquare size={12} strokeWidth={2} aria-hidden="true" />
                                {formatNumber(c.questions)} {c.questions === 1 ? "question" : "questions"}
                              </span>
                            </span>
                          </span>
                        </Link>
                      ) : (
                        <Link href={`/admin/conversations/${c.key}`} className="group flex gap-3.5 px-4 py-4 transition-colors hover:bg-canvas md:px-5">
                          <Avatar initials={c.student.initials} seed={c.student.userId ?? c.key} size={34} className="mt-0.5" />
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span className="font-semibold text-ink group-hover:text-accent">{c.student.name}</span>
                              <span className="min-w-0 truncate text-[13px] text-muted">on {c.documentTitle}</span>
                            </span>
                            <span className="line-clamp-2 text-[13.5px] leading-snug text-body">
                              {labelled && c.label?.summary ? c.label.summary : `“${c.preview.trim() || "…"}”`}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                              <MoodChip mood={labelled ? c.label?.mood : null} pending={c.label?.status === "pending"} />
                              <span className="text-[12px] text-muted">
                                {formatDayAndTime(c.startedOn)} · {formatNumber(c.questions)} {c.questions === 1 ? "question" : "questions"}
                              </span>
                            </span>
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Pagination
                page={data.page}
                pageSize={data.pageSize}
                total={data.total}
                noun={data.total === 1 ? "conversation" : "conversations"}
                busy={isFetching}
                sizes={SIZES}
                onPage={(p) => {
                  url.set({ page: p > 1 ? p : undefined, open: undefined });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPageSize={(s) => setFilters({ size: s === 25 ? undefined : String(s) })}
              />
            </>
          )}
        </div>

        {split &&
          (openKey ? (
            <ConversationPane
              key={openKey}
              conversationKey={openKey}
              position={{ index: Math.max(0, index), total: items.length }}
              onPrev={prev}
              onNext={next}
              onClose={() => openRow(undefined)}
              style={paneStyle}
            />
          ) : (
            <div
              style={paneStyle}
              className="sticky flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line px-8 text-center"
            >
              <MessagesSquare size={22} strokeWidth={1.6} aria-hidden="true" className="text-faint" />
              <p className="text-[14px] font-semibold text-ink">Pick a conversation to read it here</p>
              <p className="max-w-[40ch] text-[13px] leading-relaxed text-subtle">
                You’ll see the whole thread with Claude’s read beside it. Press{" "}
                <kbd className="rounded border border-line px-1 font-mono text-[11px]">J</kbd> to open the first one, then{" "}
                <kbd className="rounded border border-line px-1 font-mono text-[11px]">J</kbd> and{" "}
                <kbd className="rounded border border-line px-1 font-mono text-[11px]">K</kbd> to move.
              </p>
            </div>
          ))}
      </div>
    </>
  );
};

export default ConversationsView;
