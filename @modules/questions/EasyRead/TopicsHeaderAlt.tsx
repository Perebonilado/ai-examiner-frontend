import React, { FC } from "react";
import TopicsHeader, { TopicHeaderProps } from "./TopicsHeader";

export type { TopicHeaderProps };

/** Topics header for the document page's Topics tab (inside the bordered topics card). */
const TopicsHeaderAlt: FC<TopicHeaderProps> = (props) => {
  return <TopicsHeader {...props} className="px-5 pb-4 pt-5" />;
};

export default TopicsHeaderAlt;
