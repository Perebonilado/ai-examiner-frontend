import React, { FC } from "react";
import ReadingProgressBar from "./ReadingProgressBar";
import Button from "@/@shared/ui/Button";
import CheckboxAlt from "@/@shared/ui/Input/Checkbox/CheckboxAlt";
import { DocumentTopicv2DTO } from "@/dto/document-topic.dto";

export interface TopicHeaderProps {
  markedTopics: Map<number, DocumentTopicv2DTO>;
  readingProgress: number;
  handleMarkAsRead: () => Promise<void>;
  handleMarkAsUnread: () => Promise<void>;
  topics: DocumentTopicv2DTO[];
  handleNewTest: () => void;
  handleMarkAll: () => void;
}

const TopicsHeader: FC<TopicHeaderProps> = ({
  markedTopics,
  readingProgress,
  handleMarkAsRead,
  handleMarkAsUnread,
  topics,
  handleNewTest,
  handleMarkAll,
}) => {
  return (
    <div className="flex flex-col gap-4 justify-between border-b border-gray-100 px-4 py-3 bg-gray-50">
      {markedTopics.size === 0 ? (
        <ReadingProgressBar progress={readingProgress} />
      ) : (
        <div className="flex justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button title="New test" size="small" onClick={handleNewTest} />
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
              handleCheck={handleMarkAll}
              isChecked={markedTopics.size === topics?.length}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicsHeader;
