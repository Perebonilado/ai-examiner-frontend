import React, { FC, Fragment, useMemo, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { ArrowDownWideNarrow, Download } from "lucide-react";
import { toast } from "react-toastify";
import {
  downloadActivityCsv,
  useGetAdminActivityQuery,
  useGetAdminActivitySummaryQuery,
} from "@/api-services/admin.service";
import { ActivityItem, ActivityType, AdminActivityQuery, DayRange } from "@/models/admin.model";
import Spinner from "@/@shared/components/Spinner";
import { ACTIVITY_GROUPS, ACTIVITY_ORDER, ACTIVITY_TYPES, groupOf } from "./activityTypes";
import { dayLabel, formatKey, formatNumber, formatTime, lagosDateKey, sentenceCase, todayKey } from "./format";
import { addDays, clampRange, formatRange, rangePhrase, rangeQuery, readRange } from "./range";
import { useUrlState } from "./useUrlState";
import { DateRangePicker } from "./kit/DateRangePicker";
import { FilterTokens, MultiSelectMenu, SelectMenu } from "./kit/Menus";
import { Pagination } from "./kit/Pagination";
import { PersonSearch } from "./kit/PersonSearch";
import { StackedHistogram } from "./charts/StackedHistogram";
import { EmptyState, ErrorState, LoadingBlock, PageHeader, TypeChip, buttonClass } from "./ui";

const SIZES = [25, 50, 100];

const lagos = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", ...o });

/** "Yesterday · Sunday 22 November" or "Saturday 21 November". */
const dayHeading = (day: string) => {
  const label = dayLabel(day);
  return label === "Today" || label === "Yesterday" ? `${label} · ${formatKey.long(day)}` : formatKey.long(day);
};

/** Rows grouped under their Lagos day, newest (or oldest) first as they came. */
const byDay = (items: ActivityItem[]) => {
  const out: { day: string; items: ActivityItem[] }[] = [];
  for (const item of items) {
    const day = lagosDateKey(item.createdOn);
    if (out[out.length - 1]?.day !== day) out.push({ day, items: [] });
    out[out.length - 1].items.push(item);
  }
  return out;
};

/** Everything people did: a range, who, which kinds, a histogram to zoom with, and numbered pages. */
const ActivityView: FC = () => {
  const url = useUrlState();
  const today = todayKey();
  const range = readRange(url.query, "7d", today);
  const types = (url.get("types")?.split(",") ?? []).filter((t): t is ActivityType =>
    ACTIVITY_ORDER.includes(t as ActivityType)
  );
  const search = url.get("q") ?? "";
  const personId = url.get("person");
  const personName = url.get("personName");
  const sort = url.get("sort") === "oldest" ? "oldest" : "newest";
  const pageSize = SIZES.includes(Number(url.get("size"))) ? Number(url.get("size")) : 50;
  const page = Math.max(1, Number(url.get("page")) || 1);
  const [exporting, setExporting] = useState(false);

  const args: AdminActivityQuery = {
    from: range.from,
    to: range.to,
    types,
    search: personId ? undefined : search || undefined,
    userId: personId,
    page,
    pageSize,
    sort,
  };
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminActivityQuery(args, {
    skip: !url.ready,
    refetchOnMountOrArgChange: 30,
  });
  const summary = useGetAdminActivitySummaryQuery(args, { skip: !url.ready, refetchOnMountOrArgChange: 30 });

  /** Any filter change starts again from page 1. */
  const setFilters = (patch: Record<string, string | undefined>) => url.set({ ...patch, page: undefined });
  const setRange = (r: DayRange) => setFilters(rangeQuery(r, today));
  const setTypes = (next: ActivityType[]) =>
    setFilters({ types: next.length && next.length < ACTIVITY_ORDER.length ? next.join(",") : undefined });
  const clearAll = () =>
    setFilters({ types: undefined, q: undefined, person: undefined, personName: undefined, sort: undefined });

  const tokens = [
    ...(types.length
      ? [
          {
            key: "types",
            label: (
              <>
                Kind is <b className="font-semibold text-ink">{types.map((t) => ACTIVITY_TYPES[t].label).join(", ")}</b>
              </>
            ),
            onRemove: () => setTypes([]),
          },
        ]
      : []),
    ...(personId
      ? [
          {
            key: "person",
            label: (
              <>
                Person is <b className="font-semibold text-ink">{personName ?? "one person"}</b>
              </>
            ),
            onRemove: () => setFilters({ person: undefined, personName: undefined }),
          },
        ]
      : search
        ? [
            {
              key: "q",
              label: (
                <>
                  Person matches <b className="font-semibold text-ink">“{search}”</b>
                </>
              ),
              onRemove: () => setFilters({ q: undefined }),
            },
          ]
        : []),
  ];

  /* ----- Histogram ----- */
  const hist = summary.data?.histogram;
  const visibleGroups = ACTIVITY_GROUPS.filter((g) => !types.length || g.types.some((t) => types.includes(t)));
  const histBuckets = useMemo(() => {
    if (!hist) return [];
    return hist.buckets.map((b) => {
      const counts: Record<string, number> = {};
      for (const g of ACTIVITY_GROUPS) {
        counts[g.key] = g.types
          .filter((t) => !types.length || types.includes(t))
          .reduce((sum, t) => sum + (b.counts[t] ?? 0), 0);
      }
      const at = new Date(b.start);
      const day = lagosDateKey(at);
      if (hist.unit === "hour") {
        const time = lagos({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
        return { label: time, title: `${formatKey.weekdayDayMonth(day)}, ${time}`, counts };
      }
      if (hist.unit === "day") return { label: formatKey.dayMonth(day), title: formatKey.weekdayDayMonth(day), counts };
      const end = addDays(day, 6) > range.to ? range.to : addDays(day, 6);
      return { label: formatKey.dayMonth(day), title: formatRange({ from: day, to: end }), counts };
    });
  }, [hist, types, range.to]);

  const zoom =
    hist && hist.unit !== "hour"
      ? (i: number, j: number) => {
          const start = lagosDateKey(new Date(hist.buckets[i].start));
          const lastStart = lagosDateKey(new Date(hist.buckets[j].start));
          const end = hist.unit === "week" ? addDays(lastStart, 6) : lastStart;
          setRange(clampRange({ from: start, to: end > range.to ? range.to : end }, today));
        }
      : undefined;

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadActivityCsv(args);
    } catch {
      toast.error("We couldn't export the activity. Try again in a moment.");
    } finally {
      setExporting(false);
    }
  };

  const groups = data ? byDay(data.items) : [];
  const multiDay = range.from !== range.to;

  return (
    <>
      <PageHeader
        title="Activity log"
        subtitle={
          data
            ? `${formatNumber(data.total)} ${data.total === 1 ? "action" : "actions"} by ${formatNumber(data.people)} ${
                data.people === 1 ? "person" : "people"
              } ${rangePhrase(range, today)}`
            : " "
        }
        actions={
          <button type="button" onClick={handleExport} disabled={exporting || !data?.total} className={buttonClass.secondary}>
            {exporting ? <Spinner size="xs" tone="current" /> : <Download size={16} strokeWidth={1.8} aria-hidden="true" />}
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />

      <div className="sticky top-14 z-20 -mx-4 flex flex-col gap-2.5 border-b border-line bg-canvas px-4 py-3 md:top-0 md:-mx-9 md:px-9">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangePicker label="Date range" value={range} stepper onChange={(r) => r && setRange(r)} />
          <PersonSearch
            value={search}
            placeholder="Search people"
            onChange={(q) => setFilters({ q: q || undefined, person: undefined, personName: undefined })}
            onPick={(p) => setFilters({ person: p.id, personName: p.name, q: undefined })}
            className="w-full sm:w-[240px]"
          />
          <MultiSelectMenu
            label="Kind"
            allLabel="Every kind"
            value={types}
            onChange={setTypes}
            options={ACTIVITY_ORDER.map((t) => ({
              value: t,
              label: ACTIVITY_TYPES[t].label,
              swatch: groupOf(t).color,
              count: summary.data?.byType[t],
            }))}
          />
          <SelectMenu
            label="Order"
            value={sort}
            icon={<ArrowDownWideNarrow size={15} strokeWidth={2} aria-hidden="true" className="text-subtle" />}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
            onChange={(v) => setFilters({ sort: v === "oldest" ? "oldest" : undefined })}
          />
        </div>
        <FilterTokens tokens={tokens} onClearAll={clearAll} />
      </div>

      <section
        aria-labelledby="volume-h"
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 pb-4 pt-4 transition-opacity",
          summary.isFetching && "opacity-60"
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="mr-auto flex flex-col">
            <h2 id="volume-h" className="text-[15px] font-bold text-ink">
              Over time
            </h2>
            <p className="text-[12.5px] text-subtle">
              {hist?.unit === "hour" ? "Per hour" : hist?.unit === "week" ? "Per week" : "Per day"}
              {zoom ? " · drag across bars to zoom in" : ""}
            </p>
          </div>
          <ul aria-label="Kinds (pick to show only one)" className="flex flex-wrap gap-1">
            {visibleGroups.map((g) => {
              const n = summary.data ? g.types.reduce((s, t) => s + (summary.data!.byType[t] ?? 0), 0) : 0;
              return (
                <li key={g.key}>
                  <button
                    type="button"
                    onClick={() => setTypes(types.length && g.types.every((t) => types.includes(t)) && types.length === g.types.length ? [] : g.types)}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[12px] font-medium text-body transition-colors hover:bg-hover"
                  >
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ background: g.color }} />
                    {g.label}
                    <span className="font-mono text-[11px] text-muted">{formatNumber(n)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {summary.isLoading ? (
          <div className="h-[150px]" />
        ) : (
          <StackedHistogram
            caption={`Activity ${rangePhrase(range, today)}, by kind`}
            groups={visibleGroups}
            buckets={histBuckets}
            onSelect={zoom}
          />
        )}
      </section>

      <div
        aria-busy={isFetching}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-line bg-surface transition-opacity",
          isFetching && !isLoading && "opacity-60"
        )}
      >
        {isLoading || (!data && !isError) ? (
          <LoadingBlock label="Loading activity" />
        ) : !data ? (
          <ErrorState onRetry={refetch} />
        ) : data.items.length === 0 ? (
          <EmptyState title="Nothing here">
            No activity matches {rangePhrase(range, today)}.{" "}
            {tokens.length > 0 && (
              <button type="button" onClick={clearAll} className={buttonClass.link}>
                Clear the filters
              </button>
            )}
          </EmptyState>
        ) : (
          <>
            {/* Phones and tablets */}
            <ul aria-label="Activity" className="lg:hidden">
              {groups.map((g) => (
                <li key={g.day}>
                  <p className="border-b border-line bg-well px-4 py-1.5 text-[12px] font-bold text-subtle">
                    {dayHeading(g.day)}
                  </p>
                  <ul className="divide-y divide-line">
                    {g.items.map((e) => (
                      <li key={e.id} className="flex flex-col gap-1.5 px-4 py-3">
                        <span className="flex min-w-0 items-center gap-2.5">
                          <TypeChip type={e.type} />
                          <Link
                            href={`/admin/users/${e.userId}`}
                            className="min-w-0 truncate text-sm font-semibold text-ink hover:text-accent"
                          >
                            {e.userName}
                          </Link>
                          <span className="ml-auto shrink-0 font-mono text-[12px] text-muted">{formatTime(e.createdOn)}</span>
                        </span>
                        <span className="text-sm leading-[1.5] text-body">{sentenceCase(e.detail)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="hidden lg:block">
              <table className="!table w-full border-collapse text-sm">
                <caption className="sr-only">
                  Activity {rangePhrase(range, today)}, {sort === "oldest" ? "oldest" : "newest"} first, page {data.page}
                </caption>
                <thead>
                  <tr className="text-left text-[12px] font-semibold text-subtle">
                    <th scope="col" className="w-[96px] border-b border-line py-3 pl-5 pr-3 font-semibold">
                      Time
                    </th>
                    <th scope="col" className="w-[220px] border-b border-line px-3 py-3 font-semibold">
                      Person
                    </th>
                    <th scope="col" className="w-[120px] border-b border-line px-3 py-3 font-semibold">
                      Kind
                    </th>
                    <th scope="col" className="border-b border-line py-3 pl-3 pr-5 font-semibold">
                      What happened
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <Fragment key={g.day}>
                      {(multiDay || groups.length > 1) && (
                        <tr>
                          <th
                            scope="colgroup"
                            colSpan={4}
                            className="border-b border-line bg-well py-1.5 pl-5 text-left text-[12px] font-bold text-subtle"
                          >
                            {dayHeading(g.day)}
                          </th>
                        </tr>
                      )}
                      {g.items.map((e) => (
                        <tr key={e.id} className="group transition-colors hover:bg-canvas">
                          <td className="whitespace-nowrap border-b border-hover py-2.5 pl-5 pr-3 font-mono text-[12.5px] text-muted">
                            {formatTime(e.createdOn)}
                          </td>
                          <td className="whitespace-nowrap border-b border-hover px-3 py-2.5">
                            <Link href={`/admin/users/${e.userId}`} className="font-semibold text-ink hover:text-accent">
                              {e.userName}
                            </Link>
                          </td>
                          <td className="border-b border-hover px-3 py-2.5">
                            <TypeChip type={e.type} />
                          </td>
                          <td className="border-b border-hover py-2.5 pl-3 pr-5 text-body">{sentenceCase(e.detail)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              noun={data.total === 1 ? "action" : "actions"}
              busy={isFetching}
              sizes={SIZES}
              onPage={(p) => {
                url.set({ page: p > 1 ? p : undefined });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPageSize={(s) => setFilters({ size: s === 50 ? undefined : String(s) })}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ActivityView;
