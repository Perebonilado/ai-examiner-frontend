import React, { FC } from "react";
import cn from "classnames";
import { TopicsV2Model } from "@/models/file-upload.model";

interface Props {
  topic: TopicsV2Model;
  selected: boolean;
  handleSelect: (topic: TopicsV2Model) => void;
}

const TopicMenuItem: FC<Props> = ({ handleSelect, selected, topic }) => {
  const rootClassname = cn(
    `border border-[#CECECE] rounded-lg p-4 cursor-pointer hover:border-[#9E69E3]`,
    {
      ["bg-[#F7F4FF] !border-[#9E69E3]"]: selected,
    }
  );
  return (
    <div
      className={rootClassname}
      onClick={() => {
        handleSelect(topic);
      }}
    >
      <p className="text-sm w-full text-center">{topic.title}</p>
      {topic.startPage && topic.endPage && (
        <p className="text-xs mt-1 text-gray-400 text-center">
          {topic.startPage == topic.endPage
            ? `Page ${topic.startPage}`
            : `Pages ${topic.startPage} - ${topic.endPage}`}
        </p>
      )}
    </div>
  );
};

export default TopicMenuItem;
