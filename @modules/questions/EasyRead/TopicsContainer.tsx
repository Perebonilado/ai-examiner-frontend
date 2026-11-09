import React, { FC, useEffect, useState } from "react";
import TopicItem, { TopicStatus } from "./TopicItem";
import TopicsSelectionBar from "./TopicsSelectionBar";
import { AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useGetAllSavedDocumentTopicsV2Query } from "@/api-services/document-topic.service";
import { DocumentTopicv2DTO } from "@/dto/document-topic.dto";
import { useDispatch } from "react-redux";
import { openNewTestForm } from "@/features/newTestSlice";
import {
  useCreateReadingProgressMutation,
  useDeleteReadingProgressMutation,
} from "@/api-services/reading-progress.service";
import cn from "classnames";
import { PanelRightOpen } from "lucide-react";
import TopicsHeader, { TopicHeaderProps } from "./TopicsHeader";

interface Props {
  easyReadView?: boolean;
  topicsScrollContainerMaxHeightPx?: number | null;
  customHeader?: (props: TopicHeaderProps) => React.ReactNode;
  /** Easy Read only: classes for the panel (width, border, visibility). */
  className?: string;
  /** Easy Read only: adds a close button to the header (phone topics sheet). */
  onClose?: () => void;
  /** Easy Read desktop: "Hide" in the header folds the panel to a slim TOPICS tab. */
  collapsed?: boolean;
  onHide?: () => void;
  onShow?: () => void;
}

const TopicsContainer: FC<Props> = ({
  easyReadView = true,
  topicsScrollContainerMaxHeightPx = null,
  customHeader,
  className,
  onClose,
  collapsed = false,
  onHide,
  onShow,
}) => {
  const params = useParams();
  const [documentId, setDocumentId] = useState("");
  useEffect(() => {
    if (params) {
      setDocumentId(params.id as string);
    }
  }, [params]);

  const { data: topics } = useGetAllSavedDocumentTopicsV2Query(
    { documentId },
    { skip: !documentId }
  );
  const [markedTopics, setMarkedTopics] = useState<
    Map<number, DocumentTopicv2DTO>
  >(new Map());

  const dispatch = useDispatch();

  const [createReadingProgress] = useCreateReadingProgressMutation();
  const [deleteReadingProgress] = useDeleteReadingProgressMutation();

  // Both show the change at once (the request updates the list before the server answers) and
  // clear the selection straight away, so the bar can't send the same request twice.
  const handleMarkAsRead = async () => {
    const unreadTopicIds = Array.from(markedTopics.values())
      .filter((v) => !v.isRead)
      .map((v) => v.id);
    setMarkedTopics(new Map());
    if (unreadTopicIds.length) {
      await createReadingProgress({ documentId, topicIds: unreadTopicIds });
    }
  };

  const handleMarkAsUnread = async () => {
    const readTopicIds = Array.from(markedTopics.values())
      .filter((v) => v.isRead)
      .map((v) => v.id);
    setMarkedTopics(new Map());
    if (readTopicIds.length) {
      await deleteReadingProgress({ topicIds: readTopicIds });
    }
  };

  const [readingProgress, setReadingProgress] = useState(0);
  const [showTopicsContainer, setShowTopicsContainer] = useState(true);

  useEffect(() => {
    if (topics && topics.length) {
      const readTopics = topics.filter((t) => t.isRead);
      const readingPercentage = Math.floor(
        (readTopics.length / topics.length) * 100
      );
      setReadingProgress(Math.floor(readingPercentage));
    }

    if (topics?.length) {
      const hasPages = topics.every(
        (topic) => topic.startPage && topic.endPage
      );

      if (!hasPages) {
        setShowTopicsContainer(false);
      }
    }
  }, [JSON.stringify(topics)]);

  const handleMarkAll = () => {
    if (topics?.length) {
      if (markedTopics.size === topics.length) {
        setMarkedTopics((prev) => {
          const emtpyMap: typeof prev = new Map();
          return emtpyMap;
        });
      } else {
        setMarkedTopics((prev) => {
          const newMap: typeof prev = new Map();
          for (const topic of topics) {
            newMap.set(topic.id, topic);
          }
          return newMap;
        });
      }
    }
  };

  const handleNewTest = () => {
    dispatch(
      openNewTestForm({
        documentId,
        topics: topics || [],
        selectedTopics: Array.from(markedTopics.values()),
      })
    );
    // The phone topics sheet gives way to the New test form.
    if (onClose) onClose();
  };

  const clearSelection = () => setMarkedTopics(new Map());

  const headerProps: TopicHeaderProps = {
    markedTopics,
    readingProgress,
    topics: topics || [],
    handleMarkAll,
    handleMarkAsRead,
    handleMarkAsUnread,
    handleNewTest,
  };

  const hasSelection = markedTopics.size > 0;
  const nextIndex = topics ? topics.findIndex((t) => !t.isRead) : -1;
  const statusOf = (idx: number): TopicStatus =>
    topics?.[idx]?.isRead ? "read" : idx === nextIndex ? "next" : "todo";
  // The line from topic i to i+1 is green when both are read, or when it leads from a read topic
  // into "next". Topics read out of order (after a gap) get no green line into unread ones.
  const lineDone = (idx: number) =>
    !!topics?.[idx]?.isRead &&
    !!topics?.[idx + 1] &&
    (topics[idx + 1].isRead || idx + 1 === nextIndex);

  if (!showTopicsContainer) return null;

  // Folded: a slim vertical tab on the right edge, like the PAGES rail on the left.
  if (easyReadView && collapsed) {
    return (
      <div className="hidden w-[30px] shrink-0 justify-center border-l border-line bg-surface pt-4 md:flex">
        <button
          type="button"
          onClick={onShow}
          title="Show topics"
          aria-label="Show topics"
          className="inline-flex items-center gap-2 self-start py-1.5 text-[11px] font-semibold tracking-[.16em] text-muted transition-colors [writing-mode:vertical-rl] hover:text-ink"
        >
          <PanelRightOpen size={14} strokeWidth={1.75} aria-hidden="true" />
          TOPICS
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col bg-surface",
        easyReadView
          ? className
          : "overflow-hidden rounded-xl border border-line"
      )}
    >
      {/* Header */}
      {easyReadView && <TopicsHeader {...headerProps} onClose={onClose} onHide={onHide} />}

      {!easyReadView && customHeader && customHeader(headerProps)}

      {/* Scrollable list: the reading path */}
      {topics && (
        <ul
          aria-label="Topics"
          className={cn("min-h-0 overflow-y-auto overscroll-contain pt-1", {
            "flex-1": easyReadView,
            "pb-16": easyReadView && !hasSelection,
            "pb-32": easyReadView && hasSelection,
            "pb-20": !easyReadView && hasSelection,
          })}
          style={{
            maxHeight:
              topicsScrollContainerMaxHeightPx === null
                ? undefined
                : `${topicsScrollContainerMaxHeightPx}px`,
          }}
        >
          {topics.map((topic, idx) => (
            <TopicItem
              key={topic.id ?? idx}
              topic={topic}
              status={statusOf(idx)}
              isFirst={idx === 0}
              isLast={idx === topics.length - 1}
              lineAboveDone={idx > 0 && lineDone(idx - 1)}
              lineBelowDone={lineDone(idx)}
              isChecked={!!markedTopics.get(topic.id)}
              handleCheck={(id) => {
                setMarkedTopics((prev) => {
                  const newMap = new Map(prev);
                  if (newMap.get(id)) {
                    newMap.delete(id);
                  } else {
                    newMap.set(id, topic);
                  }
                  return newMap;
                });
              }}
            />
          ))}
        </ul>
      )}

      <AnimatePresence>
        {hasSelection && (
          <TopicsSelectionBar
            count={markedTopics.size}
            total={topics?.length ?? 0}
            compact={easyReadView}
            hasUnreadSelected={Array.from(markedTopics.values()).some((t) => !t.isRead)}
            onNewTest={handleNewTest}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onSelectAll={handleMarkAll}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopicsContainer;
