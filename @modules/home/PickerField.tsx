import React, { FC } from "react";
import cn from "classnames";
import { ChevronDown, LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value?: string;
  placeholder?: string;
  icon: LucideIcon;
  onClick: () => void;
  isOpen?: boolean;
  id: string;
}

/* A labelled field that opens a chooser dialog (test format, total questions, study tool). */
const PickerField: FC<Props> = ({
  label,
  value,
  placeholder,
  icon: Icon,
  onClick,
  isOpen = false,
  id,
}) => {
  const isEmpty = !value;
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span id={`${id}-label`} className="text-[13px] font-semibold text-ink">
        {label}
      </span>
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label ${id}`}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2.5 w-full h-11 pl-[13px] pr-3 rounded-[10px] border bg-surface shadow-xs text-sm text-left transition-[border-color,box-shadow]",
          "hover:border-[#c9c8d0] focus-visible:outline-none focus-visible:border-accent-bright focus-visible:ring-4 focus-visible:ring-[rgba(124,58,237,0.14)]",
          isOpen ? "border-accent-bright ring-4 ring-[rgba(124,58,237,0.14)]" : "border-control"
        )}
      >
        <Icon
          size={16}
          strokeWidth={1.75}
          className="flex-shrink-0 text-muted"
          aria-hidden
        />
        <span
          className={cn("flex-1 min-w-0 truncate tabular-nums", {
            "font-medium text-ink": !isEmpty,
            "text-faint": isEmpty,
          })}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className="flex-shrink-0 text-faint"
          aria-hidden
        />
      </button>
    </div>
  );
};

export default PickerField;
