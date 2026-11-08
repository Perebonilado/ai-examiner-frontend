import React, { FC } from "react";
import Link from "next/link";
import cn from "classnames";

interface Props {
  title: string;
  isActive: boolean;
  link: string;
  icon: React.ReactNode;
  /** Force the label on (mobile drawer) regardless of the collapsed state. */
  showTextByDefault?: boolean | null;
  collapsed?: boolean;
  callBackOnClick?: () => void;
}

/** Sidebar navigation row: grey icon + label; the current page sits on a white chip with a violet icon. */
const CollapsibleButton: FC<Props> = ({
  title,
  isActive,
  link,
  icon,
  callBackOnClick,
  showTextByDefault = null,
  collapsed = false,
}) => {
  const showLabel = showTextByDefault ?? !collapsed;

  return (
    <Link
      href={link}
      title={showLabel ? undefined : title}
      aria-label={showLabel ? undefined : title}
      aria-current={isActive ? "page" : undefined}
      onClick={() => callBackOnClick?.()}
      className={cn(
        "group flex h-[38px] items-center gap-[11px] whitespace-nowrap rounded-lg text-sm transition-colors",
        showLabel ? "w-full px-2.5" : "w-11 justify-center",
        isActive
          ? "bg-surface font-semibold text-ink shadow-[0_1px_2px_rgba(16,12,40,0.06),0_0_0_1px_var(--line)]"
          : "font-medium text-body hover:bg-hover hover:text-ink"
      )}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center [&>svg]:h-[18px] [&>svg]:w-[18px]",
          isActive ? "text-accent" : "text-muted group-hover:text-ink"
        )}
      >
        {icon}
      </span>
      {showLabel && <span className="truncate">{title}</span>}
    </Link>
  );
};

export default CollapsibleButton;
