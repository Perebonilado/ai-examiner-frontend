import React, { FC } from "react";
import cn from "classnames";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  count: number;
  total: number;
  /** Narrow panels (Easy Read, phone sheet): the actions go on their own row. */
  compact: boolean;
  /** At least one selected topic isn't read yet: offer "Mark as read", else "Mark as unread". */
  hasUnreadSelected: boolean;
  onNewTest: () => void;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const primary =
  "inline-flex h-9 items-center justify-center rounded-full bg-brand px-4 text-[13px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_10px_-4px_rgba(11,11,12,0.35)] transition-colors hover:bg-brand-hover";
const secondary =
  "aix-glass-button inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold text-ink transition-colors";
const quiet =
  "inline-flex h-8 items-center rounded-full px-2.5 text-[12.5px] font-semibold text-subtle transition-colors hover:bg-white/60 hover:text-ink dark:hover:bg-white/10";
const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Floating liquid-glass bar over the bottom of the topics list while topics are selected. */
const TopicsSelectionBar: FC<Props> = ({
  count,
  total,
  compact,
  hasUnreadSelected,
  onNewTest,
  onMarkAsRead,
  onMarkAsUnread,
  onSelectAll,
  onClear,
}) => {
  const reduceMotion = useReducedMotion();
  const label = `${count} ${count === 1 ? "topic" : "topics"} selected`;
  const markButton = hasUnreadSelected ? (
    <button type="button" onClick={onMarkAsRead} className={cn(secondary, focus, compact && "flex-1")}>
      Mark as read
    </button>
  ) : (
    <button type="button" onClick={onMarkAsUnread} className={cn(secondary, focus, compact && "flex-1")}>
      Mark as unread
    </button>
  );
  const listButtons = (
    <>
      {count < total && (
        <button type="button" onClick={onSelectAll} className={cn(quiet, focus)}>
          Select all
        </button>
      )}
      <button type="button" onClick={onClear} className={cn(quiet, focus)}>
        Clear
      </button>
    </>
  );

  return (
    <motion.div
      role="region"
      aria-label="Selected topics"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "aix-glass absolute z-10 text-ink",
        compact
          ? "inset-x-3 bottom-3 rounded-[22px] p-2.5 pl-4"
          : "inset-x-6 bottom-5 flex items-center gap-1.5 rounded-full py-2 pl-5 pr-2"
      )}
    >
      {compact ? (
        <>
          <div className="flex items-center gap-1">
            <span aria-live="polite" className="flex-1 text-[13px] font-bold">
              {label}
            </span>
            {listButtons}
          </div>
          <div className="-ml-1.5 mt-2 flex gap-2">
            <button type="button" onClick={onNewTest} className={cn(primary, focus, "flex-1")}>
              New test
            </button>
            {markButton}
          </div>
        </>
      ) : (
        <>
          <span aria-live="polite" className="mr-auto text-[13.5px] font-bold">
            {label}
          </span>
          {listButtons}
          <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-line" />
          <button type="button" onClick={onNewTest} className={cn(primary, focus)}>
            New test
          </button>
          {markButton}
        </>
      )}
    </motion.div>
  );
};

export default TopicsSelectionBar;
