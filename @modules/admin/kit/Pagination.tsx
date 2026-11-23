import React, { FC } from "react";
import cn from "classnames";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { formatNumber } from "../format";
import { SelectMenu } from "./Menus";

/** Page numbers to show: always the first and last, two either side of the current, gaps as null. */
export const pageWindow = (page: number, pages: number): (number | null)[] => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out: (number | null)[] = [1];
  const start = Math.max(2, Math.min(page - 1, pages - 4));
  const end = Math.min(pages - 1, Math.max(page + 1, 5));
  if (start > 2) out.push(null);
  for (let p = start; p <= end; p++) out.push(p);
  if (end < pages - 1) out.push(null);
  out.push(pages);
  return out;
};

const iconButton =
  "grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-subtle transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-30";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize?: (size: number) => void;
  sizes?: number[];
  /** "actions", "people" */
  noun: string;
  busy?: boolean;
}

/** "1–50 of 455", rows per page, and numbered pages with first / previous / next / last. */
export const Pagination: FC<Props> = ({ page, pageSize, total, onPage, onPageSize, sizes = [25, 50, 100], noun, busy }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(total, page * pageSize);
  return (
    <nav
      aria-label="Pages"
      className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t border-line px-4 py-3 text-[13px] text-subtle md:px-5"
    >
      {onPageSize && (
        <SelectMenu
          label="Rows"
          value={String(pageSize)}
          options={sizes.map((s) => ({ value: String(s), label: String(s) }))}
          onChange={(v) => onPageSize(Number(v))}
          className="h-8"
        />
      )}
      <p aria-live="polite" className="mr-auto tabular-nums">
        <b className="font-semibold text-ink">
          {formatNumber(first)}–{formatNumber(last)}
        </b>{" "}
        of {formatNumber(total)} {noun}
        {busy && <span className="sr-only"> (loading)</span>}
      </p>
      <div className="flex items-center gap-0.5">
        <button type="button" aria-label="First page" disabled={page <= 1} onClick={() => onPage(1)} className={iconButton}>
          <ChevronsLeft size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className={iconButton}
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <span className="hidden items-center gap-0.5 sm:flex">
          {pageWindow(page, pages).map((p, i) =>
            p === null ? (
              <span key={`gap${i}`} aria-hidden="true" className="grid h-8 w-6 place-items-center text-muted">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPage(p)}
                className={cn(
                  "h-8 min-w-8 rounded-[8px] px-2 text-[13px] font-semibold tabular-nums transition-colors",
                  p === page ? "bg-ink text-surface" : "text-body hover:bg-hover"
                )}
              >
                {formatNumber(p)}
              </button>
            )
          )}
        </span>
        <span className="px-2 font-semibold text-body tabular-nums sm:hidden">
          {formatNumber(page)} / {formatNumber(pages)}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className={iconButton}
        >
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Last page"
          disabled={page >= pages}
          onClick={() => onPage(pages)}
          className={iconButton}
        >
          <ChevronsRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
