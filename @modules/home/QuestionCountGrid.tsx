import React, { FC, ReactNode } from "react";
import cn from "classnames";
import { Lock } from "lucide-react";

interface Props {
  options: number[];
  selected: number;
  maxCount: number;
  onSelect: (value: number) => void;
  labelledBy?: string;
}

/* Two columns (5–20 | 25–40). Values above the plan limit are disabled with a lock. */
const QuestionCountGrid: FC<Props> = ({
  options,
  selected,
  maxCount,
  onSelect,
  labelledBy,
}) => {
  const midIndex = Math.ceil(options.length / 2);
  const left = options.slice(0, midIndex);
  const right = options.slice(midIndex);
  const ordered = left.flatMap((v, i) =>
    right[i] !== undefined ? [v, right[i]] : [v]
  );

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="grid grid-cols-2 gap-x-2.5 gap-y-2 tabular-nums"
    >
      {ordered.map((value) => {
        const isDisabled = value > maxCount;
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => onSelect(value)}
            className={cn(
              "relative grid place-items-center h-[46px] px-3.5 rounded-[10px] border-[1.5px] text-[15px] font-semibold transition-colors",
              {
                "border-accent bg-accent-50 text-ink": isSelected,
                "border-edge bg-surface text-ink hover:border-accent-300":
                  !isSelected && !isDisabled,
                "border-line bg-well text-faint cursor-not-allowed": isDisabled,
              }
            )}
          >
            {value}
            {isDisabled && (
              <Lock
                size={14}
                strokeWidth={1.75}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
                aria-label="Not in your plan"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export const CountNote: FC<{ icon: ReactNode; children: ReactNode }> = ({
  icon,
  children,
}) => (
  <p className="flex items-start gap-2 text-[13px] leading-[1.45] text-subtle">
    <span className="mt-0.5 text-muted [&_svg]:w-[15px] [&_svg]:h-[15px]" aria-hidden>
      {icon}
    </span>
    <span>{children}</span>
  </p>
);

export default QuestionCountGrid;
