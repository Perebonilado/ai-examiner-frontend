import React, { FC } from "react";
import cn from "classnames";
import { X } from "lucide-react";
import ReadingProgressBar from "./ReadingProgressBar";
import Button from "@/@shared/ui/Button";
import TopicCheckbox from "./TopicCheckbox";
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

/** "Topics · n of N read", a thin progress track, and the actions once topics are selected. */
const TopicsHeader: FC<TopicHeaderProps> = ({
  markedTopics,
  readingProgress,
  handleMarkAsRead,
  handleMarkAsUnread,
  topics,
  handleNewTest,
  handleMarkAll,
  onClose,
  onHide,
  className,
}) => {
  const readCount = topics.filter((topic) => topic.isRead).length;
  const selectedCount = markedTopics.size;
  const allSelected = selectedCount > 0 && selectedCount === topics.length;
  const hasUnreadSelected = Array.from(markedTopics.values()).some(
    (topic) => topic.isRead === false
  );

  return (
    <div className={cn("shrink-0 border-b border-line px-5 pb-3.5 pt-[18px]", className)}>
      <div className="flex min-h-[20px] items-center justify-between gap-3">
        <h2 className="text-[13.5px] font-bold text-ink">Topics</h2>
        <div className="flex items-center gap-1">
          {/* Keyed so the count is a fresh node when it changes: the page's Google Translate wraps
              text nodes, and React's in-place text updates then never reach the screen ("0 of 0"). */}
          <span key={`${readCount}/${topics.length}`} className="text-xs tabular-nums text-muted">
            {readCount} of {topics.length} read
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

      <div className="mt-2.5">
        <ReadingProgressBar progress={readingProgress} />
      </div>

      {selectedCount > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <Button title="New test" size="small" onClick={handleNewTest} />
          {hasUnreadSelected ? (
            <Button
              title="Mark as read"
              size="small"
              variant="outlined"
              onClick={handleMarkAsRead}
            />
          ) : (
            <Button
              title="Mark as unread"
              size="small"
              variant="outlined"
              onClick={handleMarkAsUnread}
            />
          )}
          <TopicCheckbox
            className="ml-auto"
            checked={allSelected}
            indeterminate={!allSelected}
            onChange={handleMarkAll}
            label={allSelected ? "Deselect all topics" : "Select all topics"}
          />
        </div>
      )}
    </div>
  );
};

export default TopicsHeader;
