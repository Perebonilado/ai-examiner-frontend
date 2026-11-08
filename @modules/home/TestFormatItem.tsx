import React, { FC } from "react";
import cn from "classnames";

export type StudyToolTitle = "Summarize" | "Easy read";

export type TestFormatTitle =
  | "Multiple Choice"
  | "Flash Cards"
  | "Multiple True-False"
  | "Oral (viva)"
  | "Essay";

export interface TestFormatItem {
  title: TestFormatTitle | StudyToolTitle;
  description: string;
  value: number;
  icon: React.ReactNode;
  isBeta?: boolean;
  handleSelect?: (value: number) => void;
  selected?: boolean;
}

/** Display label: "Multiple True-False" -> "Multiple true-false". */
const sentenceCase = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/* One format card. Selection = violet border + tinted fill; no radio mark. */
const TestFormatItem: FC<TestFormatItem> = ({
  icon,
  title,
  description,
  value,
  isBeta,
  handleSelect,
  selected,
}) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={!!selected}
      className={cn(
        "flex items-center gap-3.5 w-full py-[11px] pl-3 pr-3.5 rounded-xl border-[1.5px] text-left transition-colors",
        selected
          ? "border-accent bg-accent-50"
          : "border-edge bg-surface hover:border-accent-300"
      )}
      onClick={() => {
        handleSelect && handleSelect(value);
      }}
    >
      <span
        className={cn(
          "w-10 h-10 flex-shrink-0 grid place-items-center rounded-[10px] [&_svg]:w-[19px] [&_svg]:h-[19px]",
          selected ? "bg-surface text-accent" : "bg-sunken text-subtle"
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 text-[14.5px] leading-[1.3] font-[650] text-ink">
          {sentenceCase(title)}
          {isBeta && (
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-accent-50 text-accent-900 text-[11px] font-semibold">
              Beta
            </span>
          )}
        </span>
        <span className="block mt-0.5 text-[13px] leading-[1.4] text-muted">
          {description}
        </span>
      </span>
    </button>
  );
};

export default TestFormatItem;
