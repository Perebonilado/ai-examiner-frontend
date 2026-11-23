import React, { FC, ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react";
import { toast } from "react-toastify";
import { downloadUsersCsv, useGetAdminUsersQuery } from "@/api-services/admin.service";
import { AdminUserRow, AdminUsersQuery, DayRange, UserPlan, UserSegment, UserSort } from "@/models/admin.model";
import Spinner from "@/@shared/components/Spinner";
import { PLAN_CHIPS } from "./activityTypes";
import { formatJoined, formatNumber, formatReading, initialsOf, relativeTime, todayKey } from "./format";
import { clampRange, formatRange, matchPreset, presetByKey, PresetKey } from "./range";
import { useUrlState } from "./useUrlState";
import { DateRangePicker } from "./kit/DateRangePicker";
import { FilterTokens, SelectMenu } from "./kit/Menus";
import { Pagination } from "./kit/Pagination";
import { PersonSearch } from "./kit/PersonSearch";
import { Avatar, Chip, EmptyState, ErrorState, LoadingBlock, PageHeader, buttonClass } from "./ui";

const SIZES = [25, 50, 100];

const SEGMENTS: { value: UserSegment; label: string; description?: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "online", label: "Online now" },
  { value: "active_today", label: "Active today" },
  { value: "active_7d", label: "Active in the last 7 days" },
  { value: "active_30d", label: "Active in the last 30 days" },
  { value: "inactive_30d", label: "Not seen in 30 days", description: "Used the app before, nothing in the last 30 days" },
  { value: "never_used", label: "Never used it", description: "Signed up, then did nothing" },
];

const PLANS: { value: UserPlan | ""; label: string }[] = [
  { value: "", label: "Any plan" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "guest", label: "Guest" },
];

const COLUMNS: { key: UserSort | null; label: string; align?: "right"; className?: string; firstDir: "asc" | "desc" }[] = [
  { key: "name", label: "Name", firstDir: "asc" },
  { key: null, label: "Plan", firstDir: "asc" },
  { key: "last_active", label: "Last active", firstDir: "desc" },
  { key: "created_on", label: "Signed up", firstDir: "desc" },
  { key: "documents", label: "Documents", align: "right", firstDir: "desc" },
  { key: "tests", label: "Tests made", align: "right", firstDir: "desc" },
  { key: "finished", label: "Finished", align: "right", firstDir: "desc" },
  { key: "score", label: "Avg score", align: "right", firstDir: "desc" },
  { key: "reading", label: "Easy Read", align: "right", firstDir: "desc" },
];

const isSegment = (v: unknown): v is UserSegment => SEGMENTS.some((s) => s.value === v);
const isPlan = (v: unknown): v is UserPlan => v === "free" || v === "paid" || v === "guest";
const isSort = (v: unknown): v is UserSort => COLUMNS.some((c) => c.key === v);

const LastActive: FC<{ user: AdminUserRow; now: Date }> = ({ user, now }) => {
  if (user.online)
    return (
      <span className="inline-flex items-center gap-[7px] font-bold text-success-strong">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
        Online now
      </span>
    );
  if (!user.lastSeenAt) return <span className="text-muted">Never</span>;
  const recent = now.getTime() - new Date(user.lastSeenAt).getTime() < 86_400_000;
  return (
    <span className="inline-flex items-center gap-[7px] text-body">
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", recent ? "bg-[#f4cb5a]" : "bg-control")} />
      {relativeTime(user.lastSeenAt, now)}
    </span>
  );
};

const Score: FC<{ value: number | null }> = ({ value }) =>
  value === null ? (
    <span className="text-faint">–</span>
  ) : (
    <span className="inline-flex items-center justify-end gap-2">
      <span aria-hidden="true" className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-hover xl:block">
        <span className="block h-full rounded-full bg-[var(--viz-primary)]" style={{ width: `${Math.max(2, value)}%` }} />
      </span>
      {value}%
    </span>
  );

const Stat: FC<{ label: string; value: number; on?: boolean; onClick?: () => void; note?: ReactNode }> = ({
  label,
  value,
  on,
  onClick,
  note,
}) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={cn(
      "flex min-w-0 flex-col gap-0.5 rounded-2xl border bg-surface px-4 py-3 text-left transition-colors",
      on ? "border-ink" : "border-line hover:border-control"
    )}
  >
    <span className="text-[12.5px] font-semibold text-subtle">{label}</span>
    <span className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink tabular-nums">{formatNumber(value)}</span>
    {note && <span className="text-[12px] text-muted">{note}</span>}
  </button>
);

/** Everyone with an account: search, segment, plan, sign-up dates, sort any column, page through, export. */
const UsersView: FC = () => {
  const router = useRouter();
  const url = useUrlState();
  const today = todayKey();
  const search = url.get("q") ?? url.get("search") ?? "";
  const segment = isSegment(url.get("segment") ?? url.get("filter")) ? ((url.get("segment") ?? url.get("filter")) as UserSegment) : "all";
  const plan = isPlan(url.get("plan")) ? (url.get("plan") as UserPlan) : "";
  const joinedPreset = presetByKey(url.get("joined"));
  const joined: DayRange | null = joinedPreset
    ? joinedPreset.range(today)
    : url.get("joinedFrom") && url.get("joinedTo")
      ? clampRange({ from: url.get("joinedFrom")!, to: url.get("joinedTo")! }, today)
      : null;
  const sort: UserSort = isSort(url.get("sort")) ? (url.get("sort") as UserSort) : "last_active";
  const dir = url.get("dir") === "asc" ? "asc" : url.get("dir") === "desc" ? "desc" : (COLUMNS.find((c) => c.key === sort)?.firstDir ?? "desc");
  const pageSize = SIZES.includes(Number(url.get("size"))) ? Number(url.get("size")) : 25;
  const page = Math.max(1, Number(url.get("page")) || 1);
  const [exporting, setExporting] = useState(false);

  const args: AdminUsersQuery = {
    search: search || undefined,
    segment,
    plan,
    joinedFrom: joined?.from,
    joinedTo: joined?.to,
    sort,
    dir,
    page,
    pageSize,
  };
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminUsersQuery(args, {
    skip: !url.ready,
    refetchOnMountOrArgChange: 30,
  });
  const now = new Date();

  const setFilters = (patch: Record<string, string | undefined>) =>
    url.set({ ...patch, page: undefined, filter: undefined, search: undefined });
  const setJoined = (r: DayRange | null) => {
    const p = r ? matchPreset(r, today) : undefined;
    setFilters(
      !r
        ? { joined: undefined, joinedFrom: undefined, joinedTo: undefined }
        : p
          ? { joined: p.key, joinedFrom: undefined, joinedTo: undefined }
          : { joined: undefined, joinedFrom: r.from, joinedTo: r.to }
    );
  };
  const setSort = (key: UserSort) => {
    const col = COLUMNS.find((c) => c.key === key)!;
    const nextDir = key === sort ? (dir === "asc" ? "desc" : "asc") : col.firstDir;
    url.set({ sort: key === "last_active" ? undefined : key, dir: nextDir === col.firstDir ? undefined : nextDir, page: undefined });
  };
  const clearAll = () =>
    setFilters({ q: undefined, segment: undefined, plan: undefined, joined: undefined, joinedFrom: undefined, joinedTo: undefined });

  const segmentMeta = SEGMENTS.find((s) => s.value === segment)!;
  const tokens = [
    ...(search ? [{ key: "q", label: <>Name or email has <b className="font-semibold text-ink">“{search}”</b></>, onRemove: () => setFilters({ q: undefined }) }] : []),
    ...(segment !== "all" ? [{ key: "segment", label: <b className="font-semibold text-ink">{segmentMeta.label}</b>, onRemove: () => setFilters({ segment: undefined }) }] : []),
    ...(plan ? [{ key: "plan", label: <>Plan is <b className="font-semibold text-ink">{PLAN_CHIPS[plan].label}</b></>, onRemove: () => setFilters({ plan: undefined }) }] : []),
    ...(joined
      ? [
          {
            key: "joined",
            label: (
              <>
                Signed up <b className="font-semibold text-ink">{(matchPreset(joined, today)?.label ?? formatRange(joined)).toLowerCase()}</b>
              </>
            ),
            onRemove: () => setJoined(null),
          },
        ]
      : []),
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadUsersCsv(args);
    } catch {
      toast.error("We couldn't export the users. Try again in a moment.");
    } finally {
      setExporting(false);
    }
  };

  const counts = data?.counts;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={data ? `${formatNumber(data.total)} ${data.total === 1 ? "person matches" : "people match"}` : " "}
        actions={
          <button type="button" onClick={handleExport} disabled={exporting || !data?.total} className={buttonClass.secondary}>
            {exporting ? <Spinner size="xs" tone="current" /> : <Download size={16} strokeWidth={1.8} aria-hidden="true" />}
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" aria-label="Quick segments">
        <Stat
          label="Registered"
          value={counts?.registered ?? 0}
          on={segment === "all" && !plan}
          onClick={() => setFilters({ segment: undefined, plan: undefined })}
          note="Accounts, guests not included"
        />
        <Stat
          label="Active, last 30 days"
          value={counts?.active30d ?? 0}
          on={segment === "active_30d"}
          onClick={() => setFilters({ segment: "active_30d" })}
          note={counts?.registered ? `${((counts.active30d / counts.registered) * 100).toFixed(1)}% of everyone` : " "}
        />
        <Stat
          label="Paid"
          value={counts?.paid ?? 0}
          on={plan === "paid"}
          onClick={() => setFilters({ plan: "paid", segment: undefined })}
          note={counts?.registered ? `${((counts.paid / counts.registered) * 100).toFixed(1)}% of everyone` : " "}
        />
        <Stat
          label="Guests"
          value={counts?.guests ?? 0}
          on={plan === "guest"}
          onClick={() => setFilters({ plan: "guest", segment: undefined })}
          note="Tried it without an account"
        />
        <Stat
          label="Online now"
          value={counts?.online ?? 0}
          on={segment === "online"}
          onClick={() => setFilters({ segment: "online" })}
          note={<span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", counts?.online ? "bg-success" : "bg-control-strong")} />Right now</span>}
        />
      </div>

      <div className="sticky top-14 z-20 -mx-4 flex flex-col gap-2.5 border-b border-line bg-canvas px-4 py-3 md:top-0 md:-mx-9 md:px-9">
        <div className="flex flex-wrap items-center gap-2.5">
          <PersonSearch
            value={search}
            placeholder="Search by name or email"
            onChange={(q) => setFilters({ q: q || undefined })}
            onPick={(p) => router.push(`/admin/users/${p.id}`)}
            className="w-full sm:w-[280px]"
          />
          <SelectMenu label="Who" value={segment} options={SEGMENTS} placeholder onChange={(v) => setFilters({ segment: v === "all" ? undefined : v })} />
          <SelectMenu label="Plan" value={plan} options={PLANS} placeholder onChange={(v) => setFilters({ plan: v || undefined })} />
          <DateRangePicker
            label="Signed up"
            prefix="Signed up"
            value={joined}
            anyTimeLabel="Any time"
            presets={["today", "yesterday", "7d", "30d", "90d", "this_month", "last_month", "12m"] as PresetKey[]}
            onChange={setJoined}
          />
        </div>
        <FilterTokens tokens={tokens} onClearAll={clearAll} />
      </div>

      <div
        aria-busy={isFetching}
        className={cn("relative overflow-hidden rounded-2xl border border-line bg-surface transition-opacity", isFetching && !isLoading && "opacity-60")}
      >
        {isLoading || (!data && !isError) ? (
          <LoadingBlock label="Loading users" />
        ) : !data ? (
          <ErrorState onRetry={refetch} />
        ) : data.users.length === 0 ? (
          <EmptyState title="No one matches">
            Try a different name or email, or another filter.{" "}
            {tokens.length > 0 && (
              <button type="button" onClick={clearAll} className={buttonClass.link}>
                Clear the filters
              </button>
            )}
          </EmptyState>
        ) : (
          <>
            {/* Phones and tablets: one row per person, the whole row opens them. */}
            <ul aria-label={`Users, page ${data.page}`} className="divide-y divide-line lg:hidden">
              {data.users.map((user) => {
                const chip = PLAN_CHIPS[user.plan] ?? PLAN_CHIPS.free;
                return (
                  <li key={user.id}>
                    <Link href={`/admin/users/${user.id}`} className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas">
                      <Avatar initials={initialsOf(user.name)} seed={user.id} size={34} />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="min-w-0 truncate font-semibold text-ink">{user.name}</span>
                          <Chip tone={chip.tone} size="sm" className="shrink-0">
                            {chip.label}
                          </Chip>
                        </span>
                        <span className="truncate text-[13px] text-muted">{user.email ?? "No email"}</span>
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
                          <LastActive user={user} now={now} />
                          <span className="text-subtle">
                            · {formatNumber(user.documents)} {user.documents === 1 ? "doc" : "docs"} ·{" "}
                            {formatNumber(user.tests)} {user.tests === 1 ? "test" : "tests"}
                            {user.averageScore !== null ? ` · avg ${user.averageScore}%` : ""}
                            {user.readingSeconds ? ` · ${formatReading(user.readingSeconds)} reading` : ""}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              <table className="!table w-full min-w-[1040px] border-collapse text-sm">
                <caption className="sr-only">Users, page {data.page}</caption>
                <thead>
                  <tr>
                    {COLUMNS.map((c) => {
                      const on = c.key === sort;
                      return (
                        <th
                          key={c.label}
                          scope="col"
                          aria-sort={on ? (dir === "asc" ? "ascending" : "descending") : undefined}
                          className={cn(
                            "border-b border-line px-3 py-2.5 text-[12px] font-semibold text-subtle first:pl-5 last:pr-5",
                            c.align === "right" ? "text-right" : "text-left"
                          )}
                        >
                          {c.key ? (
                            <button
                              type="button"
                              onClick={() => setSort(c.key!)}
                              className={cn(
                                "-mx-1.5 inline-flex h-7 items-center gap-1 rounded-[7px] px-1.5 transition-colors hover:bg-hover hover:text-ink",
                                on && "text-ink",
                                c.align === "right" && "flex-row-reverse"
                              )}
                            >
                              {c.label}
                              {on ? (
                                dir === "asc" ? (
                                  <ArrowUp size={13} strokeWidth={2.2} aria-hidden="true" />
                                ) : (
                                  <ArrowDown size={13} strokeWidth={2.2} aria-hidden="true" />
                                )
                              ) : (
                                <ArrowUpDown size={13} strokeWidth={2} aria-hidden="true" className="opacity-40" />
                              )}
                            </button>
                          ) : (
                            c.label
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => {
                    const chip = PLAN_CHIPS[user.plan] ?? PLAN_CHIPS.free;
                    const cell = "border-b border-hover px-3 py-2.5 align-middle first:pl-5 last:pr-5";
                    return (
                      <tr key={user.id} className="group transition-colors hover:bg-canvas">
                        <td className={cell}>
                          <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3">
                            <Avatar initials={initialsOf(user.name)} seed={user.id} size={32} />
                            <span className="flex min-w-0 flex-col">
                              <span className="font-semibold text-ink group-hover:text-accent">{user.name}</span>
                              <span className="text-[12.5px] text-muted">{user.email ?? "No email"}</span>
                            </span>
                          </Link>
                        </td>
                        <td className={cell}>
                          <Chip tone={chip.tone} size="md">
                            {chip.label}
                          </Chip>
                        </td>
                        <td className={cn(cell, "whitespace-nowrap")}>
                          <LastActive user={user} now={now} />
                        </td>
                        <td className={cn(cell, "whitespace-nowrap text-subtle")}>{formatJoined(user.createdOn, now)}</td>
                        <td className={cn(cell, "text-right tabular-nums")}>{formatNumber(user.documents)}</td>
                        <td className={cn(cell, "text-right tabular-nums")}>{formatNumber(user.tests)}</td>
                        <td className={cn(cell, "text-right tabular-nums")}>{formatNumber(user.testsFinished)}</td>
                        <td className={cn(cell, "text-right tabular-nums")}>
                          <Score value={user.averageScore} />
                        </td>
                        <td className={cn(cell, "whitespace-nowrap text-right tabular-nums")}>
                          {user.readingSeconds ? formatReading(user.readingSeconds) : <span className="text-faint">–</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              noun={data.total === 1 ? "person" : "people"}
              busy={isFetching}
              sizes={SIZES}
              onPage={(p) => {
                url.set({ page: p > 1 ? p : undefined });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPageSize={(s) => setFilters({ size: s === 25 ? undefined : String(s) })}
            />
          </>
        )}
      </div>
    </>
  );
};

export default UsersView;
