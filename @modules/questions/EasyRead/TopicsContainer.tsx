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

const TopicsContainer: FC = () => {
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

  const [ readingProgress, setReadingProgress ] = useState(0)

  useEffect(()=>{
    if(topics && topics.length) {
      const readTopics = topics.filter((t)=>t.isRead)
      const readingPercentage = Math.floor((readTopics.length / topics.length) * 100);
      setReadingProgress(Math.floor(readingPercentage))
    }
  },[JSON.stringify(topics)])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between border-b border-gray-100 px-4 py-3 bg-gray-50">
        {markedTopics.size === 0 ? (
          <ReadingProgressBar progress={readingProgress} />
        ) : (
          <div className="flex justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                title="New test"
                size="small"
                onClick={() => {
                  dispatch(
                    openNewTestForm({
                      documentId,
                      topics: topics || [],
                      selectedTopics: markedTopics.values().toArray(),
                    })
                  );
                }}
              />
              {markedTopics.values().some((topic) => topic.isRead === false) ? (
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
            </div>

            <div className="flex items-center mr-0">
              <CheckboxAlt
                handleCheck={() => {
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
                }}
                isChecked={markedTopics.size === topics?.length}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable List */}
      {topics && (
        <div className="w-full  overflow-y-auto no-scrollbar h-full pb-20">
          {topics.map((topic, idx) => {
            return (
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicsContainer;
