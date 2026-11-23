import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { BookOpenText, FileText, MessagesSquare, ListChecks, Search } from "lucide-react";
import { useGetDocumentsQuery } from "@/api-services/admin.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatJoined, formatNumber, formatReading, todayKey } from "../format";
import { rangePhrase, rangeQuery, readRange } from "../range";
import { useUrlState } from "../useUrlState";
import { DateRangePicker } from "../kit/DateRangePicker";
import { FilterTokens, SelectMenu } from "../kit/Menus";
import { Pagination } from "../kit/Pagination";
import { Chip, EmptyState, ErrorState, LoadingBlock, PageHeader, buttonClass } from "../ui";
import { DOC_KINDS, FIELDS, LEVELS } from "./insightsText";

const SIZES = [24, 48, 96];

/** Grey, like the app's documents page: a type badge, not a colour code. */
export const FileBadge: FC<{ type: string | null; className?: string }> = ({ type, className }) => (
  <span
    aria-hidden="true"
    className={cn("relative grid h-10 w-8 shrink-0 place-items-end rounded-[6px] border border-control bg-surface pb-1", className)}
  >
    <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-bl-[4px] border-b border-l border-control bg-well" />
    <span className="mx-auto font-mono text-[8.5px] font-semibold uppercase text-subtle">{(type ?? "doc").slice(0, 4)}</span>
  </span>
);

/** Every document students uploaded, with Claude's read of what it is. */
const DocumentsView: FC = () => {
  const url = useUrlState();
  const today = todayKey();
  const range = readRange(url.query, "30d", today);
  const field = url.get("field") ?? "";
  const kind = url.get("kind") ?? "";
  const fileType = url.get("type") ?? "";
  const pageSize = SIZES.includes(Number(url.get("size"))) ? Number(url.get("size")) : 24;
  const page = Math.max(1, Number(url.get("page")) || 1);
  const [text, setText] = useState(url.get("q") ?? "");
  const typed = useDebouncedValue(text.trim(), 350);
  useEffect(() => {
    if (!url.ready) return;
    if ((url.get("q") ?? "") !== typed) url.set({ q: typed || undefined, page: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);

  const { data, isLoading, isFetching, isError, refetch } = useGetDocumentsQuery(
    {
      from: range.from,
      to: range.to,
      search: url.get("q") || undefined,
      field: field || undefined,
      kind: kind || undefined,
      fileType: fileType || undefined,
      userId: url.get("person"),
      page,
      pageSize,
    },
    { skip: !url.ready, refetchOnMountOrArgChange: 30 }
  );
  const setFilters = (patch: Record<string, string | undefined>) => url.set({ ...patch, page: undefined });
  const clearAll = () => {
    setText("");
    setFilters({ field: undefined, kind: undefined, type: undefined, q: undefined, person: undefined });
  };
  const facets = data?.facets;
  const labelled = facets ? facets.fields.reduce((a, f) => a + f.count, 0) : 0;

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle={data ? `${formatNumber(data.total)} ${data.total === 1 ? "upload" : "uploads"} ${rangePhrase(range, today)} · ${formatNumber(labelled)} classified by Claude` : " "}
      />

      <div className="sticky top-14 z-20 -mx-4 flex flex-col gap-2.5 border-b border-line bg-canvas px-4 py-3 md:top-0 md:-mx-9 md:px-9">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangePicker label="Uploaded" value={range} stepper onChange={(r) => r && setFilters(rangeQuery(r, today))} />
          <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-control bg-surface px-3 text-muted focus-within:border-ink sm:w-[220px]">
            <Search size={15} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">Search titles</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search titles"
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-faint focus:outline-none md:text-[13px]"
            />
          </label>
          <SelectMenu
            label="Field"
            value={field}
            placeholder
            options={[{ value: "", label: "Any field" }, ...(facets?.fields ?? []).map((f) => ({ value: f.key, label: FIELDS[f.key] ?? f.key, count: f.count }))]}
            onChange={(v) => setFilters({ field: v || undefined })}
          />
          <SelectMenu
            label="Kind"
            value={kind}
            placeholder
            options={[{ value: "", label: "Any kind" }, ...(facets?.kinds ?? []).map((f) => ({ value: f.key, label: DOC_KINDS[f.key] ?? f.key, count: f.count }))]}
            onChange={(v) => setFilters({ kind: v || undefined })}
          />
          <SelectMenu
            label="File"
            value={fileType}
            placeholder
            options={[{ value: "", label: "Any file" }, ...(facets?.fileTypes ?? []).map((f) => ({ value: f.key, label: f.key.toUpperCase(), count: f.count }))]}
            onChange={(v) => setFilters({ type: v || undefined })}
          />
        </div>
        <FilterTokens
          tokens={url.get("person") ? [{ key: "p", label: <>One student’s uploads</>, onRemove: () => setFilters({ person: undefined }) }] : []}
          onClearAll={clearAll}
        />
      </div>

      <div className={cn("overflow-hidden rounded-2xl border border-line bg-surface transition-opacity", isFetching && !isLoading && "opacity-60")}>
        {isLoading || (!data && !isError) ? (
          <LoadingBlock label="Loading documents" />
        ) : !data ? (
          <ErrorState onRetry={refetch} />
        ) : data.items.length === 0 ? (
          <EmptyState title="No documents here">
            Nothing matches {rangePhrase(range, today)}.{" "}
            <button type="button" onClick={clearAll} className={buttonClass.link}>
              Clear the filters
            </button>
          </EmptyState>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {data.items.map((d) => {
                const l = d.label?.status === "done" ? d.label : null;
                return (
                  <li key={d.id}>
                    <Link href={`/admin/documents/${d.id}`} className="group flex gap-3.5 px-4 py-3.5 transition-colors hover:bg-canvas md:px-5">
                      <FileBadge type={d.fileType} />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-semibold text-ink group-hover:text-accent">{d.title}</span>
                          {d.deleted && (
                            <Chip tone="grey" className="shrink-0">
                              Deleted
                            </Chip>
                          )}
                        </span>
                        {l ? (
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
                            <b className="font-semibold text-body">{l.details.subject}</b>
                            <span className="text-muted">
                              {[FIELDS[l.details.field ?? ""], DOC_KINDS[l.details.kind ?? ""], LEVELS[l.details.level ?? ""]].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[12.5px] text-faint">{d.label?.status === "pending" ? "Claude is classifying this" : "Not classified yet"}</span>
                        )}
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                          <span>
                            {d.owner.name} · {formatJoined(d.uploadedOn)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ListChecks size={12} aria-hidden="true" />
                            {formatNumber(d.usage.tests)} tests
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessagesSquare size={12} aria-hidden="true" />
                            {formatNumber(d.usage.chats)} questions
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <BookOpenText size={12} aria-hidden="true" />
                            {d.usage.readingSeconds ? formatReading(d.usage.readingSeconds) : "not read"}
                          </span>
                          {!d.usage.topics && (
                            <span className="inline-flex items-center gap-1 text-warning">
                              <FileText size={12} aria-hidden="true" />
                              no topics found
                            </span>
                          )}
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
              noun={data.total === 1 ? "document" : "documents"}
              busy={isFetching}
              sizes={SIZES}
              onPage={(p) => {
                url.set({ page: p > 1 ? p : undefined });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPageSize={(sz) => setFilters({ size: sz === 24 ? undefined : String(sz) })}
            />
          </>
        )}
      </div>
    </>
  );
};

export default DocumentsView;
