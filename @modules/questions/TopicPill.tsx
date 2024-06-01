import React, { FC } from "react";

interface Props {
  title: string;
}

const TopicPill: FC<Props> = ({ title }) => {
  return (
    <div className="w-fit border border-[#b8daff] p-4 py-2 text-xs rounded-full bg-[#f1f7fd] text-[#004085]">
      {title}
    </div>
  );
};

export default TopicPill;
