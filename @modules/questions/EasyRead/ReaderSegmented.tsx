import React, { FC } from "react";
import cn from "classnames";
import { ReaderMode, READER_MODE_LABELS } from "./types";

interface Option {
  value: ReaderMode;
  /** Extra classes for this button, e.g. to hide it below a breakpoint. */
  className?: string;
}

interface Props {
  value: ReaderMode;
  options: Option[];
  onChange: (mode: ReaderMode) => void;
  /** "dock" stretches the buttons to fill the phone bottom bar. */
  size?: "chrome" | "dock";
  className?: string;
}

/** Segmented view switch: Original | Simplified | Side by side. */
const ReaderSegmented: FC<Props> = ({
  value,
  options,
  onChange,
  size = "chrome",
  className,
}) => {
  return (
    <div
      role="group"
      aria-label="View mode"
      className={cn(
        "inline-flex gap-0.5 rounded-[10px] bg-sunken p-[3px]",
        { "flex min-w-0 flex-1": size === "dock" },
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "whitespace-nowrap rounded-lg text-[13px] font-semibold transition-colors",
              size === "dock" ? "h-9 min-w-0 flex-1 px-2" : "h-8 px-3.5",
              isActive
                ? "bg-surface text-ink shadow-[0_1px_2px_rgba(16,12,40,.1),0_0_0_0.5px_rgba(16,12,40,.06)]"
                : "text-subtle hover:text-ink",
              option.className
            )}
          >
            {READER_MODE_LABELS[option.value]}
          </button>
        );
      })}
    </div>
  );
};

export default ReaderSegmented;
