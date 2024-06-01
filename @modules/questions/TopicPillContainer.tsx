import React, { FC } from "react";
import TopicPill from "./TopicPill";
import cn from "classnames";

interface Props {
  data: string[];
  isOpen: boolean;
}

const TopicPillContainer: FC<Props> = ({ data, isOpen }) => {
  const rootClassName = cn(`overflow-y-hidden transition-all duration-[.8s] ease-in-out`,{
    ["max-h-[1000px]"]: isOpen,
    ["max-h-[0px]"]: !isOpen,
  });

  return (
    <div className={rootClassName}>
      <div className="flex items-center gap-4 flex-wrap py-4">
        {data.map((d, idx) => (
          <TopicPill title={d} key={idx} />
        ))}
      </div>
    </div>
  );
};

export default TopicPillContainer;
