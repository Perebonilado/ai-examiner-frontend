import React, { RefObject, forwardRef, useRef } from "react";
import { Page } from "react-pdf";
import useNearViewport from "./useNearViewport";

interface Props {
  pageNumber: number;
  /** Rendered page width in CSS px (zoom and fit are applied by the caller). */
  width: number;
  /** Height / width of this page (or of page 1 until this one has loaded). */
  aspect: number;
  scrollRoot: RefObject<HTMLElement>;
  onAspect: (pageNumber: number, aspect: number) => void;
}

/**
 * A white PDF page at a fixed size. The canvas and text layer are only rendered while the page
 * is near the visible area, so long documents stay light; the slot keeps its size either way.
 */
const PdfPageSlot = forwardRef<HTMLDivElement, Props>(
  ({ pageNumber, width, aspect, scrollRoot, onAspect }, ref) => {
    const slotRef = useRef<HTMLDivElement | null>(null);
    const isNear = useNearViewport(slotRef, scrollRoot, "1200px 0px");

    return (
      <div
        ref={(el) => {
          slotRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        data-page-number={pageNumber}
        aria-label={`Page ${pageNumber}`}
        role="region"
        className="relative mx-auto mb-3 overflow-hidden rounded-[3px] bg-white shadow-page md:mb-5"
        style={{ width, height: Math.round(width * aspect) }}
      >
        {isNear && (
          <Page
            pageNumber={pageNumber}
            width={width}
            loading={null}
            onLoadSuccess={(page) => {
              if (page.originalWidth > 0) {
                onAspect(pageNumber, page.originalHeight / page.originalWidth);
              }
            }}
          />
        )}
      </div>
    );
  }
);

PdfPageSlot.displayName = "PdfPageSlot";

export default PdfPageSlot;
