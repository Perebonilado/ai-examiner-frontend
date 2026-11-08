import React, { FC, PropsWithChildren } from "react";
import { ChevronRight } from "lucide-react";
import cn from "classnames";

interface Props {
  title: string;
  description: string;
  handleClick?: () => void;
  /** "link" rows open a sub-panel (value + chevron); "switch" rows toggle. */
  variant?: "link" | "switch";
  /** Current value shown before the chevron on link rows. */
  value?: string;
  /** For switch rows: the current state. */
  checked?: boolean;
}

const AdditionalSettingsItem: FC<PropsWithChildren<Props>> = ({
  description,
  title,
  children,
  handleClick,
  variant = "link",
  value,
  checked,
}) => {
  const rowClass =
    "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-left cursor-pointer transition-colors hover:bg-hover focus-visible:bg-hover";
  const text = (
    <span className="flex-1 min-w-0">
      <span className="block text-[14.5px] font-[650] text-ink">{title}</span>
      <span className="block mt-[3px] max-w-[44ch] text-[13px] leading-[1.45] text-muted">
        {description}
      </span>
    </span>
  );

  if (variant === "switch") {
    return (
      <div
        role="switch"
        aria-checked={!!checked}
        aria-label={title}
        tabIndex={0}
        className={rowClass}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleClick && handleClick();
          }
        }}
      >
        {text}
        <span
          className="flex-shrink-0 [&>div]:w-auto [&>div]:gap-0"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      className={rowClass}
      onClick={handleClick}
    >
      {text}
      <span
        className={cn(
          "flex items-center gap-1 flex-shrink-0 text-[13px] font-semibold text-subtle whitespace-nowrap"
        )}
      >
        {value}
        <ChevronRight
          size={16}
          strokeWidth={1.75}
          className="text-faint"
          aria-hidden
        />
      </span>
      {children}
    </button>
  );
};

export const SettingsSeparator: FC = () => (
  <div className="h-px mx-4 my-0.5 bg-line" role="separator" />
);

export default AdditionalSettingsItem;
