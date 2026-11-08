import React, { FC, ReactNode } from "react";
import cn from "classnames";
import { Minus, Plus } from "lucide-react";
import { ReadingSettings } from "./useReadingSettings";
import {
  FitMode,
  ScrollMode,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
  ZOOM_STEPS,
  nextZoomStep,
  prevZoomStep,
} from "./types";

interface Props extends ReadingSettings {
  update: (patch: Partial<ReadingSettings>) => void;
  /** The original PDF's current scale (1 = printed size), for the zoom read-out. */
  originalScale?: number;
  /** "sheet" is the phone version: no arrow keys, and the original always fits the width. */
  variant?: "popover" | "sheet";
  className?: string;
}

const LAYOUTS: { value: ScrollMode; label: string }[] = [
  { value: "continuous", label: "Scroll" },
  { value: "single", label: "One page" },
];

const FITS: { value: Exclude<FitMode, null>; label: string }[] = [
  { value: "width", label: "Fit width" },
  { value: "page", label: "Fit page" },
];

const Segmented = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="mt-2 flex gap-0.5 rounded-[10px] bg-sunken p-[3px]"
  >
    {options.map((option) => {
      const on = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-8 flex-1 rounded-lg text-[13px] font-semibold transition-colors",
            on
              ? "bg-surface text-ink shadow-[0_1px_2px_rgba(16,12,40,.1),0_0_0_0.5px_rgba(16,12,40,.06)]"
              : "text-subtle hover:text-ink"
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const Stepper: FC<{
  label: string;
  value: ReactNode;
  less: { label: string; content: ReactNode; disabled: boolean; onClick: () => void };
  more: { label: string; content: ReactNode; disabled: boolean; onClick: () => void };
}> = ({ label, value, less, more }) => {
  const btn =
    "grid h-10 w-12 place-items-center rounded-lg font-semibold text-ink transition-colors hover:bg-hover disabled:pointer-events-none disabled:opacity-35";
  return (
    <div
      role="group"
      aria-label={label}
      className="mt-2 flex items-center justify-between rounded-[10px] border border-line px-1.5 py-1"
    >
      <button type="button" aria-label={less.label} disabled={less.disabled} onClick={less.onClick} className={btn}>
        {less.content}
      </button>
      <span className="text-[13px] tabular-nums text-subtle" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={more.label} disabled={more.disabled} onClick={more.onClick} className={btn}>
        {more.content}
      </button>
    </div>
  );
};

/** Reading settings, as in EasiRead's reading comfort: layout, original page size, text size.
    Changes apply live behind the panel. */
const ReadingSettingsPanel: FC<Props> = ({
  scrollMode,
  textSize,
  fit,
  originalScale = 1,
  update,
  variant = "popover",
  className,
}) => {
  const isSheet = variant === "sheet";

  return (
    <div className={cn("p-5", className)}>
      <h2 className="text-sm font-bold text-ink">Reading settings</h2>

      <p className="mt-4 text-xs text-subtle">Layout</p>
      <Segmented
        label="Page layout"
        value={scrollMode}
        options={LAYOUTS}
        onChange={(value) => update({ scrollMode: value })}
      />
      {scrollMode === "single" && (
        <p className="mt-2 text-[11.5px] leading-[1.5] text-subtle">
          {isSheet
            ? "Turn pages with the arrows under each page."
            : "Turn pages with the ↑ and ↓ arrow keys."}
        </p>
      )}

      {!isSheet && (
        <>
          <p className="mt-4 text-xs text-subtle">Original page</p>
          <Segmented
            label="Original page size"
            value={fit}
            options={FITS}
            onChange={(value) => update({ fit: value })}
          />
          <Stepper
            label="Zoom"
            value={`${Math.round(originalScale * 100)}%`}
            less={{
              label: "Zoom out",
              content: <Minus size={16} strokeWidth={2} aria-hidden="true" />,
              disabled: originalScale <= ZOOM_STEPS[0] + 0.005,
              onClick: () => update({ zoom: prevZoomStep(originalScale), fit: null }),
            }}
            more={{
              label: "Zoom in",
              content: <Plus size={16} strokeWidth={2} aria-hidden="true" />,
              disabled: originalScale >= ZOOM_STEPS[ZOOM_STEPS.length - 1] - 0.005,
              onClick: () => update({ zoom: nextZoomStep(originalScale), fit: null }),
            }}
          />
        </>
      )}

      <p className="mt-4 text-xs text-subtle">Text size</p>
      <Stepper
        label="Text size"
        value={`${textSize} px`}
        less={{
          label: "Smaller text",
          content: <span className="text-[14px]">A−</span>,
          disabled: textSize <= TEXT_SIZE_MIN,
          onClick: () => update({ textSize: textSize - 1 }),
        }}
        more={{
          label: "Larger text",
          content: <span className="text-[18px]">A+</span>,
          disabled: textSize >= TEXT_SIZE_MAX,
          onClick: () => update({ textSize: textSize + 1 }),
        }}
      />
      <p className="mt-2 text-[11.5px] leading-[1.5] text-subtle">For the simplified pages.</p>
    </div>
  );
};

export default ReadingSettingsPanel;
