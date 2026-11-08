import React, { FC } from "react";
import cn from "classnames";
import { Check, Minus } from "lucide-react";

interface Props {
  checked: boolean;
  /** Some but not all selected (select-all only): violet outline with a dash. */
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}

/** 16px square checkbox used by the topics list and its select-all. */
const TopicCheckbox: FC<Props> = ({
  checked,
  indeterminate = false,
  onChange,
  label,
  className,
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border-[1.5px] transition-colors",
        checked
          ? "border-accent bg-accent text-white"
          : indeterminate
          ? "border-accent bg-surface text-accent"
          : "border-[#c9c8d0] bg-surface hover:border-accent-300",
        className
      )}
    >
      {checked ? (
        <Check size={12} strokeWidth={3} aria-hidden="true" />
      ) : indeterminate ? (
        <Minus size={12} strokeWidth={3} aria-hidden="true" />
      ) : null}
    </button>
  );
};

export default TopicCheckbox;
