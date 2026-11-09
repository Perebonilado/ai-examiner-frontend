import React, {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { pdfjs, Document } from "react-pdf";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import { addPageReader, removePageReader } from "@/features/documentChatSlice";
// react-pdf ships its own pdfjs-dist; use its document type.
import type { DocumentCallback as PDFDocumentProxy } from "react-pdf/dist/esm/shared/types.js";
import cn from "classnames";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { SimplifiedState } from "./useSimplifiedPages";
import { HighlightableText } from "@/@shared/components/HighlightableText";
import TopicsContainer from "./TopicsContainer";
import PageThumbnails, { PageThumbnailsTab } from "./PageThumbnails";
import PdfPageSlot from "./PdfPageSlot";
import SimplifiedPage from "./SimplifiedPage";
import PageTurner from "./PageTurner";
import useMediaQuery from "./useMediaQuery";
import { FitMode, ReaderMode, ScrollMode } from "./types";
import s from "./reader.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Props {
  originalFileUrl: string;
  /** Simplified pages as they arrive (placeholders until each page is done). */
  simplified: SimplifiedState;
  /** Ask for the simplified pages again after an error. */
  onRetrySimplified?: () => void;
  /** Reports the page being read, so it's simplified first. */
  onPageChange?: (page: number) => void;
  /** Effective view (side by side only arrives on wide screens). */
  mode: ReaderMode;
  /** Scroll through every page, or show one page at a time. */
  scrollMode: ScrollMode;
  /** Simplified text size in px. */
  textSize: number;
  /** Original page size (from reading settings). */
  fit: FitMode;
  /** Custom zoom for the original, used when fit is null. */
  zoom: number;
  /** Reports the original's actual scale, for the zoom read-out in reading settings. */
  onScaleChange?: (scale: number) => void;
  /** Desktop topics panel open, or folded to a slim tab. */
  topicsOpen?: boolean;
  onTopicsOpenChange?: (open: boolean) => void;
}

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

/** 100% zoom = the page at its printed size (PDF points to CSS px). */
const CSS_PX_PER_PT = 96 / 72;
/** Sticky pane header in side by side, plus the space above the first page. */
const PANE_HEAD = 40;
const SPLIT_TOP = PANE_HEAD + 16;
const PAGE_GAP = 20;

type Pane = "original" | "simple";

/** Simplified pane before the page list is known (or when it couldn't be loaded). */
const SimplifiedStatusCard: FC<{
  status: SimplifiedState["status"];
  onRetry?: () => void;
}> = ({ status, onRetry }) => (
  <div className="mx-auto mt-2 w-full max-w-[calc(70ch+104px)] rounded-[3px] bg-surface px-6 py-16 text-center shadow-page">
    {status === "error" ? (
      <>
        <p className="text-sm text-subtle">
          The simplified pages couldn&apos;t be loaded.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 text-sm font-semibold text-accent hover:text-accent-900"
          >
            Try again
          </button>
        )}
      </>
    ) : (
      <p className="text-sm text-subtle motion-safe:animate-pulse">
        Getting the simplified pages ready…
      </p>
    )}
  </div>
);

const PaneHead: FC<{ title: string; meta?: string }> = ({ title, meta }) => (
  <div className="sticky top-0 z-[4] -mx-[18px] flex h-10 items-center justify-between border-b border-line bg-sunken px-[18px] text-[12.5px] text-muted">
    <b className="font-semibold text-ink">{title}</b>
    {meta && <span className="truncate pl-3 tabular-nums">{meta}</span>}
  </div>
);

/** Index of the last page whose top edge is above `line` (viewport px). */
const pageIndexAt = (
  refs: (HTMLElement | null)[],
  count: number,
  line: number,
) => {
  let index = 0;
  for (let i = 0; i < count; i++) {
    const el = refs[i];
    if (!el) continue;
    if (el.getBoundingClientRect().top <= line) index = i;
    else break;
  }
  return index;
};

const PDFReader: FC<Props> = ({
  originalFileUrl,
  simplified,
  onRetrySimplified,
  onPageChange,
  mode,
  scrollMode,
  textSize,
  fit,
  zoom,
  onScaleChange,
  topicsOpen = true,
  onTopicsOpenChange,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isSplit = mode === "split";
  const single = scrollMode === "single";
  const showOriginal = mode !== "simplified";
  const showSimple = mode !== "original";
  const primary: Pane = mode === "simplified" ? "simple" : "original";

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  // Page 1 at 100%: width in CSS px and height / width.
  const [baseSize, setBaseSize] = useState({ width: 794, aspect: 1123 / 794 });
  const [aspects, setAspects] = useState<Record<number, number>>({});
  const [pageNumber, setPageNumber] = useState(1);
  const [paneSize, setPaneSize] = useState({ width: 0, height: 0 });
  const [railOpen, setRailOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 1024,
  );
  const [splitRailOpen, setSplitRailOpen] = useState(false);

  const originalScrollRef = useRef<HTMLDivElement>(null);
  const simpleScrollRef = useRef<HTMLDivElement>(null);
  const originalPageRefs = useRef<(HTMLElement | null)[]>([]);
  const simplePageRefs = useRef<(HTMLElement | null)[]>([]);
  // The pane the reader is scrolling; in side by side the other one follows it.
  const driverRef = useRef<Pane>("original");
  const scrollFracRef = useRef(0);
  const frameRef = useRef<Record<Pane, number | null>>({
    original: null,
    simple: null,
  });

  const simplePages = simplified.pages;
  const pageCount = primary === "simple" ? simplePages.length : totalPages;

  /* ---------- document ---------- */

  const onDocumentLoadSuccess = async (doc: PDFDocumentProxy) => {
    try {
      const first = await doc.getPage(1);
      const viewport = first.getViewport({ scale: 1 });
      if (viewport.width > 0) {
        setBaseSize({
          width: viewport.width * CSS_PX_PER_PT,
          aspect: viewport.height / viewport.width,
        });
      }
    } catch (error) {
      console.log("error", error);
    }
    setPdf(doc);
    setTotalPages(doc.numPages);
  };

  const handleAspect = useCallback((n: number, aspect: number) => {
    setAspects((prev) =>
      Math.abs((prev[n] ?? 0) - aspect) < 0.001
        ? prev
        : { ...prev, [n]: aspect },
    );
  }, []);
  const aspectOf = useCallback(
    (n: number) => aspects[n] ?? baseSize.aspect,
    [aspects, baseSize.aspect],
  );

  /* ---------- size and zoom ---------- */

  useEffect(() => {
    const el = originalScrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      // Hidden in Simplified: keep the last real size.
      if (el.clientWidth > 0) {
        setPaneSize({ width: el.clientWidth, height: el.clientHeight });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const padX = !isDesktop ? 20 : isSplit ? 36 : 48;
  const availWidth = Math.max(160, paneSize.width - padX);
  const availHeight = Math.max(
    160,
    paneSize.height - (isSplit ? SPLIT_TOP + 16 : 2 * PAGE_GAP),
  );
  const fitWidthPx = availWidth;
  const fitPagePx = Math.min(availWidth, availHeight / baseSize.aspect);
  const pageWidth = Math.round(
    !isDesktop || fit === "width"
      ? fitWidthPx
      : fit === "page"
        ? fitPagePx
        : baseSize.width * zoom,
  );
  const scale = pageWidth / baseSize.width;

  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  // Lets the floating chat button sit at the right edge when the topics panel is folded.
  useEffect(() => {
    if (topicsOpen) document.body.removeAttribute("data-topics-hidden");
    else document.body.setAttribute("data-topics-hidden", "");
    return () => document.body.removeAttribute("data-topics-hidden");
  }, [topicsOpen]);

  // Keep the reading position when the page size changes (zoom, fit, resize).
  useLayoutEffect(() => {
    const el = originalScrollRef.current;
    if (!el || !showOriginal) return;
    el.scrollTop = scrollFracRef.current * el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageWidth]);

  /* ---------- navigation ---------- */

  const scrollToPage = (pane: Pane, n: number, behavior: ScrollBehavior) => {
    const container =
      pane === "original" ? originalScrollRef.current : simpleScrollRef.current;
    const el = (pane === "original" ? originalPageRefs : simplePageRefs)
      .current[n - 1];
    if (!container || !el) return;
    const offset = isSplit ? SPLIT_TOP : isDesktop ? PAGE_GAP : 10;
    const top =
      container.scrollTop +
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      offset;
    container.scrollTo({ top: Math.max(0, top), behavior });
  };

  const goToPage = (n: number) => {
    if (n < 1 || n > pageCount) return;
    driverRef.current = primary;
    setPageNumber(n);
    // One page layout: the page swaps in and the effect below returns to its top.
    if (!single) scrollToPage(primary, n, "smooth");
  };

  // Page citations in the chat ("p. 12") turn this reader to that page.
  const dispatch = useDispatch();
  const requestedPage = useSelector(
    (state: RootState) => state.documentChatReducer.requestedPage
  );
  // A request made before this reader opened isn't for it.
  const handledRequestRef = useRef(requestedPage?.at);
  useEffect(() => {
    dispatch(addPageReader());
    return () => {
      dispatch(removePageReader());
    };
  }, [dispatch]);
  useEffect(() => {
    if (!requestedPage || requestedPage.at === handledRequestRef.current) return;
    handledRequestRef.current = requestedPage.at;
    if (pageCount > 0) goToPage(Math.min(Math.max(1, requestedPage.page), pageCount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedPage]);

  const scrollPanesToTop = () => {
    originalScrollRef.current?.scrollTo({ top: 0 });
    simpleScrollRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    onPageChange?.(pageNumber);
  }, [pageNumber, onPageChange]);

  // One page layout: every turned page starts at its top.
  useLayoutEffect(() => {
    if (single) scrollPanesToTop();
  }, [single, pageNumber]);

  // Back to Scroll: land on the page that was open.
  const prevSingleRef = useRef(single);
  useLayoutEffect(() => {
    if (prevSingleRef.current === single) return;
    prevSingleRef.current = single;
    if (single) return;
    if (showOriginal)
      scrollToPage("original", Math.min(pageNumber, totalPages), "auto");
    if (showSimple)
      scrollToPage("simple", Math.min(pageNumber, simplePages.length), "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [single]);

  // A new text size reflows the simplified pages: stay on the same page.
  const prevTextSizeRef = useRef(textSize);
  useLayoutEffect(() => {
    if (prevTextSizeRef.current === textSize) return;
    prevTextSizeRef.current = textSize;
    if (!single && primary === "simple") {
      scrollToPage("simple", Math.min(pageNumber, simplePages.length), "auto");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textSize]);

  // One page layout: ↑ / ↓ (and Page Up / Down) scroll the page, then turn it at either end.
  useEffect(() => {
    if (!single) return;
    const onKey = (e: KeyboardEvent) => {
      const step = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[
        e.key
      ];
      if (!step || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      if (document.querySelector("[aria-modal='true']")) return;
      const pane =
        primary === "simple"
          ? simpleScrollRef.current
          : originalScrollRef.current;
      if (!pane) return;
      e.preventDefault();
      const atEdge =
        step > 0
          ? pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 2
          : pane.scrollTop <= 0;
      if (atEdge) {
        goToPage(pageNumber + step);
      } else {
        const by = e.key.startsWith("Page") ? pane.clientHeight * 0.9 : 80;
        pane.scrollBy({ top: step * by });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [single, primary, pageNumber, pageCount]);

  // Switching view keeps you on the same page.
  const prevModeRef = useRef(mode);
  useLayoutEffect(() => {
    if (prevModeRef.current === mode) return;
    prevModeRef.current = mode;
    driverRef.current = primary;
    if (single) {
      scrollPanesToTop();
      return;
    }
    if (showOriginal)
      scrollToPage("original", Math.min(pageNumber, totalPages), "auto");
    if (showSimple)
      scrollToPage("simple", Math.min(pageNumber, simplePages.length), "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /* ---------- scrolling ---------- */

  const syncFrom = (from: Pane) => {
    const a =
      from === "original" ? originalScrollRef.current : simpleScrollRef.current;
    const b =
      from === "original" ? simpleScrollRef.current : originalScrollRef.current;
    const aRefs = (from === "original" ? originalPageRefs : simplePageRefs)
      .current;
    const bRefs = (from === "original" ? simplePageRefs : originalPageRefs)
      .current;
    const count = Math.min(totalPages, simplePages.length);
    if (!a || !b || !count) return;
    if (a.scrollTop <= 0) {
      b.scrollTop = 0;
      return;
    }
    // Same page, same fraction of the way through it.
    const aLine = a.getBoundingClientRect().top + SPLIT_TOP;
    const index = pageIndexAt(aRefs, count, aLine);
    const pageA = aRefs[index]?.getBoundingClientRect();
    const pageB = bRefs[index]?.getBoundingClientRect();
    if (!pageA || !pageB) return;
    const fraction = Math.min(
      1,
      Math.max(0, (aLine - pageA.top) / (pageA.height + PAGE_GAP)),
    );
    const bLine = b.getBoundingClientRect().top + SPLIT_TOP;
    b.scrollTop += pageB.top + fraction * (pageB.height + PAGE_GAP) - bLine;
  };

  const onPaneScroll = (pane: Pane) => {
    if (frameRef.current[pane] !== null) return;
    frameRef.current[pane] = requestAnimationFrame(() => {
      frameRef.current[pane] = null;
      const container =
        pane === "original"
          ? originalScrollRef.current
          : simpleScrollRef.current;
      if (!container) return;
      if (pane === "original") {
        scrollFracRef.current =
          container.scrollTop / Math.max(1, container.scrollHeight);
      }
      // One page layout: the page is set by turning, not by scrolling.
      if (single) return;
      if (isSplit && driverRef.current === pane) syncFrom(pane);
      if (pane !== primary) return;
      const count = pane === "original" ? totalPages : simplePages.length;
      if (!count) return;
      const atEnd =
        container.scrollTop > 0 &&
        container.scrollTop + container.clientHeight >=
          container.scrollHeight - 4;
      const index = atEnd
        ? count - 1
        : pageIndexAt(
            (pane === "original" ? originalPageRefs : simplePageRefs).current,
            count,
            container.getBoundingClientRect().top +
              container.clientHeight * 0.35,
          );
      setPageNumber(index + 1);
    });
  };

  useEffect(
    () => () => {
      Object.values(frameRef.current).forEach(
        (id) => id !== null && cancelAnimationFrame(id),
      );
    },
    [],
  );

  const driverHandlers = (pane: Pane) => ({
    onPointerEnter: () => (driverRef.current = pane),
    onPointerDown: () => (driverRef.current = pane),
    onWheel: () => (driverRef.current = pane),
    onTouchStart: () => (driverRef.current = pane),
    onFocusCapture: () => (driverRef.current = pane),
  });

  /* ---------- render ---------- */

  const rail = isSplit ? splitRailOpen : railOpen;
  const setRail = isSplit ? setSplitRailOpen : setRailOpen;

  // The original pane's padding; phones keep room for the bottom bar.
  const scrollClasses = isSplit
    ? "px-[18px] pb-10"
    : "px-2.5 pb-[150px] pt-2.5 md:px-6 md:pb-10 md:pt-5";

  return (
    <div className={cn("flex min-h-0 flex-1", s.reader)}>
      {rail ? (
        <PageThumbnails
          pdf={pdf}
          totalPages={totalPages}
          aspectOf={aspectOf}
          currentPage={pageNumber}
          onSelect={goToPage}
          onHide={() => setRail(false)}
        />
      ) : (
        <PageThumbnailsTab onShow={() => setRail(true)} />
      )}

      {/* Original PDF (kept mounted in Simplified so the document stays loaded) */}
      <section
        aria-label="Original"
        className={cn("relative min-w-0 flex-1 bg-sunken", {
          hidden: !showOriginal,
        })}
        {...driverHandlers("original")}
      >
        <div
          ref={originalScrollRef}
          tabIndex={0}
          aria-label="Original document"
          onScroll={() => onPaneScroll("original")}
          className={cn(
            "h-full overflow-auto overscroll-contain",
            scrollClasses,
          )}
        >
          {isSplit && <PaneHead title="Original" meta={`Page ${pageNumber}`} />}
          <HighlightableText>
            <Document
              file={originalFileUrl}
              renderMode="canvas"
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.log("error", error);
              }}
              options={options}
              onItemClick={(e) => goToPage(e.pageNumber)}
              loading={
                <p className="py-24 text-center text-[13px] text-muted">
                  One moment... getting your pages
                </p>
              }
              error={
                <p className="py-24 text-center text-[13px] text-muted">
                  This file could not be shown.
                </p>
              }
              className={cn({ "pt-4": isSplit })}
            >
              {paneSize.width > 0 &&
                Array.from({ length: totalPages }, (_, idx) =>
                  single &&
                  idx !== Math.min(pageNumber, totalPages) - 1 ? null : (
                    <PdfPageSlot
                      key={`page-${idx + 1}`}
                      ref={(el) => {
                        originalPageRefs.current[idx] = el;
                      }}
                      pageNumber={idx + 1}
                      width={pageWidth}
                      aspect={aspectOf(idx + 1)}
                      scrollRoot={originalScrollRef}
                      onAspect={handleAspect}
                    />
                  ),
                )}
            </Document>
          </HighlightableText>
          {/* One page layout: turn pages under the page. */}
          {single && totalPages > 0 && (
            <PageTurner
              pageNumber={Math.min(pageNumber, totalPages)}
              totalPages={totalPages}
              onTurn={goToPage}
              className="mt-1"
            />
          )}
        </div>
      </section>

      {/* Simplified pages */}
      <section
        aria-label="Simplified"
        className={cn("relative min-w-0 flex-1 bg-sunken", {
          hidden: !showSimple,
          "border-l border-line": isSplit,
        })}
        style={{ "--reading-size": `${textSize}px` } as React.CSSProperties}
        {...driverHandlers("simple")}
      >
        <div
          ref={simpleScrollRef}
          tabIndex={0}
          aria-label="Simplified document"
          onScroll={() => onPaneScroll("simple")}
          className={cn(
            // Simplified pages never scroll sideways (wide tables scroll inside themselves).
            "h-full overflow-y-auto overflow-x-hidden overscroll-contain",
            scrollClasses,
          )}
        >
          {isSplit && (
            <PaneHead title="Simplified" />
          )}
          {!simplePages.length && (
            <SimplifiedStatusCard
              status={simplified.status}
              onRetry={onRetrySimplified}
            />
          )}
          <HighlightableText>
            <div className={cn({ "pt-4": isSplit })}>
              {simplePages.map((page, idx) =>
                single &&
                idx !== Math.min(pageNumber, simplePages.length) - 1 ? null : (
                  <SimplifiedPage
                    key={`simple-${idx + 1}`}
                    ref={(el) => {
                      simplePageRefs.current[idx] = el;
                    }}
                    pageNumber={idx + 1}
                    html={page.html}
                    status={page.status}
                    compact={isSplit}
                    turner={
                      single && !isSplit
                        ? { totalPages: simplePages.length, onTurn: goToPage }
                        : undefined
                    }
                  />
                ),
              )}
            </div>
          </HighlightableText>
        </div>
      </section>

      {/* Topics (desktop); phones reach them from the bottom bar */}
      <TopicsContainer
        className="hidden w-[300px] shrink-0 border-l border-line md:flex lg:w-[340px]"
        collapsed={!topicsOpen}
        onHide={() => onTopicsOpenChange?.(false)}
        onShow={() => onTopicsOpenChange?.(true)}
      />
    </div>
  );
};

export default PDFReader;
