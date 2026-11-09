import React, { FC } from "react";
import cn from "classnames";
import { X } from "lucide-react";
import { DocumentTopicv2DTO } from "@/dto/document-topic.dto";

export interface TopicHeaderProps {
  markedTopics: Map<number, DocumentTopicv2DTO>;
  readingProgress: number;
  handleMarkAsRead: () => Promise<void>;
  handleMarkAsUnread: () => Promise<void>;
  topics: DocumentTopicv2DTO[];
  handleNewTest: () => void;
  handleMarkAll: () => void;
  /** Shows a close button (phone topics sheet). */
  onClose?: () => void;
  /** Shows "Hide" (desktop Easy Read panel). */
  onHide?: () => void;
  className?: string;
}

/**
 * "Topics · n of N read" and the panel's Hide / Close. Progress shows on the reading path itself,
 * and the actions for selected topics are in the floating selection bar.
 */
const TopicsHeader: FC<TopicHeaderProps> = ({ topics, onClose, onHide, className }) => {
  const readCount = topics.filter((topic) => topic.isRead).length;

  return (
    <div className={cn("shrink-0 border-b border-line px-5 pb-4 pt-[18px]", className)}>
      <div className="flex min-h-[20px] items-center justify-between gap-3">
        <h2 className="text-[13.5px] font-bold text-ink">Topics</h2>
        <div className="flex items-center gap-1">
          {/* Keyed so the count is a fresh node when it changes: the page's Google Translate wraps
              text nodes, and React's in-place text updates then never reach the screen ("0 of 0"). */}
          <span key={`${readCount}/${topics.length}`} className="text-xs tabular-nums text-muted">
            <span className={cn("font-bold", readCount ? "text-success" : "text-ink")}>
              {readCount}
            </span>{" "}
            of {topics.length} read
          </span>
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              aria-label="Hide topics"
              className="-my-1 -mr-1.5 ml-2 inline-flex h-7 items-center rounded-md px-1.5 text-[12.5px] font-semibold leading-none text-muted transition-colors hover:bg-hover hover:text-ink"
            >
              Hide
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close topics"
              className="-my-2 -mr-2 grid h-9 w-9 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicsHeader;
