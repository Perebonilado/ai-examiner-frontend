import React, { FC, forwardRef, useMemo } from "react";
import cn from "classnames";
import s from "./reader.module.css";
import PageTurner from "./PageTurner";
import cleanSimplifiedHtml from "./cleanSimplifiedHtml";

interface Props {
  pageNumber: number;
  /** Null until the page has been simplified. */
  html: string | null;
  status?: "pending" | "running" | "done" | "failed";
  /** Narrower card for the side-by-side pane. */
  compact?: boolean;
  /** One page layout: show previous / next with the page number. */
  turner?: { totalPages: number; onTurn: (page: number) => void };
}

/** While a page is being simplified: a quiet placeholder roughly the height of a page. */
const PagePlaceholder: FC<{ pageNumber: number }> = ({ pageNumber }) => (
  <div aria-hidden="true" className="min-h-[360px]">
    <p className="mb-6 text-[13px] text-muted">Simplifying page {pageNumber}…</p>
    {[92, 86, 95, 74, 0, 90, 83, 88, 60].map((width, i) =>
      width ? (
        <span
          key={i}
          className="mb-3 block h-[7px] rounded-[2px] bg-sunken motion-safe:animate-pulse"
          style={{ width: `${width}%` }}
        />
      ) : (
        <span key={i} className="block h-5" />
      )
    )}
  </div>
);

/** One simplified page: a white page on the grey canvas, typeset like EasiRead's reading column,
    with its page number at the foot. The card's width is set in `ch` of the reading size, so a
    bigger text size widens the page instead of squeezing the line. Shows a placeholder until the
    page has been simplified. */
const SimplifiedPage = forwardRef<HTMLElement, Props>(
  ({ pageNumber, html, status = "done", compact = false, turner }, ref) => {
    const clean = useMemo(() => (html ? cleanSimplifiedHtml(html) : ""), [html]);
    const isEmpty = html !== null && !clean.replace(/<[^>]*>/g, "").trim();

    return (
      <article
        ref={ref}
        data-page-number={pageNumber}
        aria-label={`Simplified page ${pageNumber}`}
        style={{ fontSize: "var(--reading-size, 16px)" }}
        className={cn(
          "mx-auto mb-3 w-full rounded-[3px] bg-surface shadow-page md:mb-5",
          compact
            ? "max-w-[calc(66ch+60px)] px-[30px] pb-6 pt-8"
            : "max-w-[calc(70ch+104px)] px-5 pb-6 pt-8 md:px-[52px] md:pb-8 md:pt-12",
        )}
      >
        {html === null ? (
          status === "failed" ? (
            <p className="py-16 text-center text-sm text-subtle">
              Page {pageNumber} couldn&apos;t be simplified. The original page is in the Original
              view.
            </p>
          ) : (
            <PagePlaceholder pageNumber={pageNumber} />
          )
        ) : isEmpty ? (
          <p className="py-16 text-center text-sm text-subtle">
            Nothing to simplify on page {pageNumber}: it has no text.
          </p>
        ) : (
          <div className={s.prose} dangerouslySetInnerHTML={{ __html: clean }} />
        )}
        {turner ? (
          <PageTurner
            pageNumber={pageNumber}
            totalPages={turner.totalPages}
            onTurn={turner.onTurn}
            className="mt-8"
          />
        ) : (
          <p className="mt-10 text-center text-xs tabular-nums text-muted">{pageNumber}</p>
        )}
      </article>
    );
  },
);

SimplifiedPage.displayName = "SimplifiedPage";

export default SimplifiedPage;
