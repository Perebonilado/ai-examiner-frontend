import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import React, { FC, useState } from "react";

interface Props {
  topicTitle: string;
  correctQuestionsCount: number;
  totalQuestionsCount: number;
  toggleTopicSelection: (topic: string) => void;
  isSelected: boolean;
}

const TopicInfoCardItem: FC<Props> = ({
  correctQuestionsCount,
  topicTitle,
  totalQuestionsCount,
  toggleTopicSelection,
  isSelected
}) => {

  return (
    <div className="flex items-center py-4 px-2 pl-6 text-xs text-[#000000] border-b border-b-gray-200">
      <div style={{ flex: 3 }} className="flex items-center">
        <Checkbox
          checked={isSelected}
          onChange={() => {
            toggleTopicSelection(topicTitle);
          }}
        />
        <p>{topicTitle}</p>
      </div>
      <div style={{ flex: 1 }}>
        <p>
          {correctQuestionsCount} out of {totalQuestionsCount}
        </p>
      </div>
    </div>
  );
};

export default TopicInfoCardItem;
