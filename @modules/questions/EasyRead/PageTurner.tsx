import React, { FC } from "react";
import cn from "classnames";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  pageNumber: number;
  totalPages: number;
  onTurn: (page: number) => void;
  className?: string;
}

/** One page layout: previous / "n of N" / next, under the page. */
const PageTurner: FC<Props> = ({ pageNumber, totalPages, onTurn, className }) => {
  const btn =
    "grid h-9 w-9 place-items-center rounded-full text-subtle transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-35";
  return (
    <nav
      aria-label="Turn page"
      className={cn("flex items-center justify-center gap-1 text-xs tabular-nums text-muted", className)}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={pageNumber <= 1}
        onClick={() => onTurn(pageNumber - 1)}
        className={btn}
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <span className="min-w-[56px] text-center">
        {pageNumber} of {totalPages}
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={pageNumber >= totalPages}
        onClick={() => onTurn(pageNumber + 1)}
        className={btn}
      >
        <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </nav>
  );
};

export default PageTurner;
