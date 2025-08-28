import React, { FC, useEffect, useState } from "react";
import TopicItem from "./TopicItem";
import { useParams } from "next/navigation";
import { useGetAllSavedDocumentTopicsV2Query } from "@/api-services/document-topic.service";
import Button from "@/@shared/ui/Button";
import { DocumentTopicv2DTO } from "@/dto/document-topic.dto";
import { useDispatch } from "react-redux";
import { openNewTestForm } from "@/features/newTestSlice";
import CheckboxAlt from "@/@shared/ui/Input/Checkbox/CheckboxAlt";
import ReadingProgressBar from "./ReadingProgressBar";
import {
  useCreateReadingProgressMutation,
  useDeleteReadingProgressMutation,
} from "@/api-services/reading-progress.service";
import cn from "classnames";
import TopicsHeader, { TopicHeaderProps } from "./TopicsHeader";

interface Props {
  easyReadView?: boolean;
  topicsScrollContainerMaxHeightPx?: number | null;
  customHeader?: (props: TopicHeaderProps) => React.ReactNode;
}

const TopicsContainer: FC<Props> = ({
  easyReadView = true,
  topicsScrollContainerMaxHeightPx = null,
  customHeader,
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

  const handleMarkAsRead = async () => {
    if (markedTopics.size > 0) {
      const unreadTopicIds = markedTopics
        .values()
        .filter((v) => v.isRead === false)
        .map((v) => v.id)
        .toArray();
      await createReadingProgress({
        documentId: documentId!,
        topicIds: unreadTopicIds,
      });

      setMarkedTopics((prev) => {
        const emtpyMap: typeof prev = new Map();
        return emtpyMap;
      });
    }
  };

  const handleMarkAsUnread = async () => {
    if (markedTopics.size > 0) {
      const readTopicIds = markedTopics
        .values()
        .filter((v) => v.isRead)
        .map((v) => v.id)
        .toArray();
      await deleteReadingProgress({
        topicIds: readTopicIds,
      });
      setMarkedTopics((prev) => {
        const emtpyMap: typeof prev = new Map();
        return emtpyMap;
      });
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
        selectedTopics: markedTopics.values().toArray(),
      })
    );
  };

  return !showTopicsContainer ? null : (
    <div
      className={cn("", {
        ["h-[calc(100vh-52px)] w-[500px] bg-gray-200 p-4 max-md:hidden"]:
          easyReadView,
      })}
    >
      <div
        className={cn("", {
          ["bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full"]:
            easyReadView,
        })}
      >
        {/* Header */}
        {easyReadView && (
          <TopicsHeader
            markedTopics={markedTopics}
            readingProgress={readingProgress}
            topics={topics || []}
            handleNewTest={handleNewTest}
            handleMarkAsRead={handleMarkAsRead}
            handleMarkAsUnread={handleMarkAsUnread}
            handleMarkAll={handleMarkAll}
          />
        )}

        {!easyReadView &&
          customHeader &&
          customHeader({
            markedTopics,
            readingProgress,
            topics: topics || [],
            handleMarkAll,
            handleMarkAsRead,
            handleMarkAsUnread,
            handleNewTest,
          })}

        {/* Scrollable List */}
        {topics && (
          <div className="relative w-full h-full">
            <div
              className="w-full overflow-y-auto no-scrollbar h-full pb-20"
              style={{
                maxHeight:
                  topicsScrollContainerMaxHeightPx === null
                    ? "unset"
                    : `${topicsScrollContainerMaxHeightPx}px`,
              }}
            >
              {topics.map((topic, idx) => (
                <TopicItem
                  {...topic}
                  key={idx}
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
            </div>

            {/* Fade overlay */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsContainer;
