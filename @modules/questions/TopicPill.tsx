import React, { FC } from "react";

interface Props {
  title: string;
}

const TopicPill: FC<Props> = ({ title }) => {
  return (
    <div className="w-fit border border-gray-300 p-4 py-2 text-sm">{title}</div>
  );
};

export default TopicPill;
