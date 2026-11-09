import React, { FC } from "react";

interface Props {
  title: string;
}

const TopicPill: FC<Props> = ({ title }) => {
  return (
    <div className="w-fit border border-accent-200 p-4 py-2 text-xs rounded-full bg-accent-50 text-accent-900">
      {title}
    </div>
  );
};

export default TopicPill;
