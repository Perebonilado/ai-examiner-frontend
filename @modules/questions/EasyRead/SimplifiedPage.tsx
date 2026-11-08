import React, { forwardRef, useMemo } from "react";
import cn from "classnames";
import s from "./reader.module.css";
import PageTurner from "./PageTurner";
import cleanSimplifiedHtml from "./cleanSimplifiedHtml";

interface Props {
  pageNumber: number;
  html: string;
  /** Narrower card for the side-by-side pane. */
  compact?: boolean;
  /** One page layout: show previous / next with the page number. */
  turner?: { totalPages: number; onTurn: (page: number) => void };
}

/** One simplified page: a white page on the grey canvas, typeset like EasiRead's reading column,
    with its page number at the foot. The card's width is set in `ch` of the reading size, so a
    bigger text size widens the page instead of squeezing the line. */
const SimplifiedPage = forwardRef<HTMLElement, Props>(
  ({ pageNumber, html, compact = false, turner }, ref) => {
    const clean = useMemo(() => cleanSimplifiedHtml(html), [html]);

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
        <div className={s.prose} dangerouslySetInnerHTML={{ __html: clean }} />
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
