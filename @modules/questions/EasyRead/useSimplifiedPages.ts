import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  useLazyGetModifiedContentQuery,
  useLazyGetSimplifiedPagesQuery,
} from "@/api-services/document.service";
import { isEasyReadLimitError } from "@/models/easy-read.model";
import { SimplifiedPageStatus } from "@/models/simplified-pages.model";

export interface SimplifiedPageView {
  status: SimplifiedPageStatus;
  /** The page's HTML once it's done. */
  html: string | null;
}

export interface SimplifiedState {
  /** "loading" before the first answer, "error" when the server keeps failing. */
  status: "loading" | "preparing" | "working" | "ready" | "error";
  totalPages: number | null;
  /** Index = page number - 1. */
  pages: SimplifiedPageView[];
}

const FIRST_CHECK_MS = 1200;
const CHECK_EVERY_MS = 2000;
const MAX_ERRORS_IN_A_ROW = 4;

/** [1,2,3,5,7,8] -> "1-3,5,7-8" */
export const compactPageList = (pages: number[]) => {
  const sorted = [...pages].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++;
    parts.push(start === sorted[i] ? `${start}` : `${start}-${sorted[i]}`);
  }
  return parts.join(",");
};

/**
 * Easy Read's simplified pages, page by page. Asks the server every couple of seconds while it
 * works, says which page the reader is on (so that page is simplified first) and which pages the
 * app already has (so they aren't sent again), and stops once every page is done.
 */
const useSimplifiedPages = ({
  documentId,
  enabled,
  priorityRef,
}: {
  documentId: string;
  enabled: boolean;
  /** The page being read (kept current by the reader). */
  priorityRef: MutableRefObject<number>;
}) => {
  const [state, setState] = useState<SimplifiedState>({
    status: "loading",
    totalPages: null,
    pages: [],
  });
  const [limitReached, setLimitReached] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [fetchPages] = useLazyGetSimplifiedPagesQuery();
  const [fetchAllAtOnce] = useLazyGetModifiedContentQuery();
  const haveRef = useRef<Set<number>>(new Set());
  const htmlRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    haveRef.current = new Set();
    htmlRef.current = new Map();
    setState({ status: "loading", totalPages: null, pages: [] });
  }, [documentId]);

  useEffect(() => {
    if (!enabled || !documentId) return;
    let stopped = false;
    let timer: number | undefined;
    let errorsInARow = 0;

    // Older backends have no /simplified-pages: load every page at once from /modified-content
    // (slower to arrive, but it works with any backend version).
    const loadAllAtOnce = async () => {
      setState({ status: "working", totalPages: null, pages: [] });
      try {
        const data = await fetchAllAtOnce({ documentId }, true).unwrap();
        if (stopped) return;
        const pages = data?.content ?? [];
        setState({
          status: "ready",
          totalPages: pages.length,
          pages: pages.map((html) => ({ status: "done", html })),
        });
      } catch (error) {
        if (stopped) return;
        if (isEasyReadLimitError(error)) {
          setLimitReached(true);
          return;
        }
        setState((prev) => ({ ...prev, status: "error" }));
      }
    };

    const check = async () => {
      if (stopped) return;
      try {
        const data = await fetchPages(
          {
            documentId,
            priority: Math.max(1, priorityRef.current || 1),
            have: compactPageList(Array.from(haveRef.current)),
          },
          false
        ).unwrap();
        if (stopped) return;
        errorsInARow = 0;

        for (const page of data.pages) {
          if (page.html) {
            htmlRef.current.set(page.pageNumber, page.html);
            haveRef.current.add(page.pageNumber);
          }
        }
        const total = data.totalPages;
        setState({
          status: data.status,
          totalPages: total,
          pages:
            total === null
              ? []
              : Array.from({ length: total }, (_, index) => {
                  const pageNumber = index + 1;
                  const info = data.pages.find((p) => p.pageNumber === pageNumber);
                  const html = htmlRef.current.get(pageNumber) ?? null;
                  return {
                    status: html ? "done" : info?.status ?? "pending",
                    html,
                  };
                }),
        });

        if (data.status !== "ready") {
          timer = window.setTimeout(check, CHECK_EVERY_MS);
        }
      } catch (error) {
        if (stopped) return;
        if (isEasyReadLimitError(error)) {
          setLimitReached(true);
          return;
        }
        if ((error as { status?: number })?.status === 404) {
          loadAllAtOnce();
          return;
        }
        errorsInARow += 1;
        if (errorsInARow >= MAX_ERRORS_IN_A_ROW) {
          setState((prev) => ({ ...prev, status: "error" }));
          return;
        }
        timer = window.setTimeout(check, CHECK_EVERY_MS * errorsInARow);
      }
    };

    timer = window.setTimeout(check, attempt === 0 ? 0 : FIRST_CHECK_MS);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [documentId, enabled, fetchPages, fetchAllAtOnce, priorityRef, attempt]);

  /** After an error: start asking again. */
  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, status: prev.totalPages ? "working" : "loading" }));
    setAttempt((n) => n + 1);
  }, []);

  return { simplified: state, limitReached, retry };
};

export default useSimplifiedPages;
