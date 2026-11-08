import React, { FC, RefObject, useEffect, useRef } from "react";
import cn from "classnames";
import { Page } from "react-pdf";
// react-pdf ships its own pdfjs-dist; use its document type.
import type { DocumentCallback as PDFDocumentProxy } from "react-pdf/dist/esm/shared/types.js";
import { PanelLeftOpen } from "lucide-react";
import useNearViewport from "./useNearViewport";

const THUMB_WIDTH = 104;

interface ThumbProps {
  pdf: PDFDocumentProxy | null;
  pageNumber: number;
  aspect: number;
  isActive: boolean;
  scrollRoot: RefObject<HTMLElement>;
  onSelect: (pageNumber: number) => void;
}

const Thumb: FC<ThumbProps> = ({ pdf, pageNumber, aspect, isActive, scrollRoot, onSelect }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const isNear = useNearViewport(ref, scrollRoot, "400px 0px");

  return (
    <li>
      <button
        ref={ref}
        type="button"
        data-thumb={pageNumber}
        onClick={() => onSelect(pageNumber)}
        aria-label={`Page ${pageNumber}`}
        aria-current={isActive ? "page" : undefined}
        className="group block w-full"
      >
        <span
          className={cn(
            "block overflow-hidden rounded-md bg-white transition-[border-color,box-shadow]",
            isActive
              ? "border-2 border-accent-bright shadow-[0_0_0_3px_rgba(124,58,237,.22)]"
              : "border border-[#e9e9ec] group-hover:border-control"
          )}
          style={{ aspectRatio: `1 / ${aspect}` }}
        >
          {pdf && isNear && (
            <Page
              pdf={pdf}
              pageNumber={pageNumber}
              width={THUMB_WIDTH - 2}
              devicePixelRatio={
                typeof window === "undefined" ? 1 : Math.min(2, window.devicePixelRatio || 1)
              }
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={null}
              className="pointer-events-none"
            />
          )}
        </span>
        <span className="mt-[5px] block text-center text-[11px] tabular-nums text-muted">
          <span
            className={cn({
              "rounded-full bg-accent-900 px-[7px] py-px font-bold text-white": isActive,
            })}
          >
            {pageNumber}
          </span>
        </span>
      </button>
    </li>
  );
};

interface Props {
  pdf: PDFDocumentProxy | null;
  totalPages: number;
  aspectOf: (pageNumber: number) => number;
  currentPage: number;
  onSelect: (pageNumber: number) => void;
  onHide: () => void;
}

/** Left rail of page thumbnails (PAGES / Hide). */
const PageThumbnails: FC<Props> = ({ pdf, totalPages, aspectOf, currentPage, onSelect, onHide }) => {
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the active thumbnail in view as the reader scrolls.
  useEffect(() => {
    const list = listRef.current;
    const thumb = list?.querySelector<HTMLElement>(`[data-thumb="${currentPage}"]`);
    if (!list || !thumb) return;
    const top = thumb.offsetTop; // the list is the offset parent
    const bottom = top + thumb.offsetHeight;
    if (top < list.scrollTop + 12) list.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
    else if (bottom > list.scrollTop + list.clientHeight - 12)
      list.scrollTo({ top: bottom - list.clientHeight + 24, behavior: "smooth" });
  }, [currentPage]);

  return (
    <nav
      aria-label="Pages"
      className="hidden w-[133px] shrink-0 flex-col border-r border-line bg-sunken md:flex"
    >
      <div className="flex h-11 items-center justify-between border-b border-line pl-3.5 pr-2">
        <span className="text-[11px] font-semibold leading-none tracking-[.16em] text-muted">PAGES</span>
        <button
          type="button"
          onClick={onHide}
          className="inline-flex h-7 items-center rounded-md px-1.5 text-[12.5px] font-semibold leading-none text-muted transition-colors hover:bg-hover hover:text-ink"
        >
          Hide
        </button>
      </div>
      <ul
        ref={listRef}
        className="no-scrollbar relative flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-3.5 py-4"
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <Thumb
            key={i}
            pdf={pdf}
            pageNumber={i + 1}
            aspect={aspectOf(i + 1)}
            isActive={currentPage === i + 1}
            scrollRoot={listRef}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  );
};

/** The folded rail: a slim vertical PAGES tab. */
export const PageThumbnailsTab: FC<{ onShow: () => void }> = ({ onShow }) => (
  <div className="hidden w-[30px] shrink-0 justify-center border-r border-line bg-sunken pt-4 md:flex">
    <button
      type="button"
      onClick={onShow}
      title="Show page thumbnails"
      aria-label="Show page thumbnails"
      className="inline-flex rotate-180 items-center gap-2 self-start py-1.5 text-[11px] font-semibold tracking-[.16em] text-muted transition-colors [writing-mode:vertical-rl] hover:text-ink"
    >
      <PanelLeftOpen size={14} strokeWidth={1.75} aria-hidden="true" />
      PAGES
    </button>
  </div>
);

export default PageThumbnails;
