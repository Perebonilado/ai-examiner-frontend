import React, { ElementRef, FC, useRef } from "react";
import cn from "classnames";
import {
  ChevronDown,
  ChevronUp,
  Minus,
  MoveHorizontal,
  Plus,
  RectangleVertical,
} from "lucide-react";

export type FitMode = "width" | "page" | null;

export const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

interface ZoomProps {
  /** Current zoom in percent of the page's natural size. */
  percent: number;
  fit: FitMode;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomTo: (percent: number) => void;
  onFit: (fit: Exclude<FitMode, null>) => void;
}

interface Props {
  pageInputVal: string;
  handlePageInputVal: (val: string) => void;
  goToPage: (val: number) => void;
  totalPages: number;
  pageNumber: number;
  /** PDF zoom controls; left out for the simplified pages. */
  zoom?: ZoomProps;
}

const pillButton =
  "grid h-[30px] w-[30px] place-items-center rounded-full text-white transition-colors hover:bg-white/[.12] disabled:opacity-40 disabled:hover:bg-transparent";
const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;

/** Dark floating page pill (desktop): zoom, fit width / fit page, and page jump. */
const PageControls: FC<Props> = ({
  goToPage,
  handlePageInputVal,
  pageInputVal,
  pageNumber,
  totalPages,
  zoom,
}) => {
  const inputRef = useRef<ElementRef<"input">>(null);

  const handleScrollToPage = (page: number, cb?: () => void) => {
    if (page >= 1 && page <= totalPages) {
      goToPage(page);
    } else {
      handlePageInputVal(String(pageNumber));
    }
    if (cb) cb();
  };

  const presets =
    zoom && !ZOOM_PRESETS.includes(zoom.percent)
      ? [...ZOOM_PRESETS, zoom.percent].sort((a, b) => a - b)
      : ZOOM_PRESETS;

  return (
    <div
      role="toolbar"
      aria-label={zoom ? "PDF controls" : "Page"}
      className="absolute bottom-[18px] left-1/2 z-[5] inline-flex h-10 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-1.5 text-[12.5px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.45)] max-md:hidden"
    >
      {zoom && (
        <>
          <div className="inline-flex items-center gap-0.5">
            <button
              type="button"
              className={pillButton}
              onClick={zoom.onZoomOut}
              disabled={zoom.percent <= 50}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <Minus {...icon} />
            </button>
            <label
              className="relative grid h-[30px] min-w-[52px] place-items-center rounded-lg px-2 font-bold tabular-nums transition-colors hover:bg-white/[.12]"
              title="Zoom level: choose a size"
            >
              {zoom.percent}%
              <select
                aria-label="Zoom level"
                value={zoom.percent}
                onChange={(e) => zoom.onZoomTo(Number(e.target.value))}
                className="absolute inset-0 cursor-pointer appearance-none opacity-0"
              >
                {presets.map((p) => (
                  <option key={p} value={p}>
                    {p}%
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={pillButton}
              onClick={zoom.onZoomIn}
              disabled={zoom.percent >= 300}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <Plus {...icon} />
            </button>
          </div>

          <span className="mx-0.5 h-[18px] w-px bg-white/[.18]" aria-hidden="true" />

          <div className="inline-flex items-center gap-0.5">
            <button
              type="button"
              className={cn(pillButton, { "bg-white/[.16]": zoom.fit === "width" })}
              onClick={() => zoom.onFit("width")}
              aria-pressed={zoom.fit === "width"}
              aria-label="Fit to width"
              title="Fit to width"
            >
              <MoveHorizontal {...icon} />
            </button>
            <button
              type="button"
              className={cn(pillButton, { "bg-white/[.16]": zoom.fit === "page" })}
              onClick={() => zoom.onFit("page")}
              aria-pressed={zoom.fit === "page"}
              aria-label="Fit to page"
              title="Fit to page"
            >
              <RectangleVertical {...icon} />
            </button>
          </div>

          <span className="mx-0.5 h-[18px] w-px bg-white/[.18]" aria-hidden="true" />
        </>
      )}

      <div className="inline-flex items-center gap-2 pl-2">
        <span>Page</span>
        <input
          type="text"
          inputMode="numeric"
          ref={inputRef}
          aria-label="Current page"
          className="h-7 w-[38px] rounded-lg border-0 bg-white/[.14] text-center text-[12.5px] font-bold tabular-nums text-white outline-none focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-accent-300"
          value={pageInputVal}
          onChange={(e) => {
            const val = e.target.value.trim();
            if (/^\d*$/.test(val)) handlePageInputVal(val);
          }}
          onBlur={(e) => {
            const val = parseInt(e.target.value.trim(), 10);
            handleScrollToPage(val);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              const page = parseInt(e.currentTarget.value, 10);
              handleScrollToPage(page, () => {
                if (inputRef.current) inputRef.current.blur();
              });
            }
          }}
        />
        <span className="tabular-nums text-white/70">of {totalPages}</span>
        <div className="inline-flex items-center">
          <button
            type="button"
            className={pillButton}
            onClick={() => handleScrollToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronUp {...icon} />
          </button>
          <button
            type="button"
            className={pillButton}
            onClick={() => handleScrollToPage(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            aria-label="Next page"
            title="Next page"
          >
            <ChevronDown {...icon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageControls;
