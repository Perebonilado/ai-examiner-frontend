import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  selected: boolean;
  handleSelect: (topic: string) => void;
}

const TopicMenuItem: FC<Props> = ({ handleSelect, selected, title }) => {
  const rootClassname = cn(
    `flex items-center gap-6 border border-[#CECECE] rounded-lg p-4 cursor-pointer hover:border-[#9E69E3]`,
    {
      ["bg-[#F7F4FF] border-[#9E69E3]"]: selected,
    }
  );
  return (
    <div
      className={rootClassname}
      onClick={() => {
        handleSelect(title);
      }}
    >
      <p className="text-sm  text-center w-full">{title}</p>
    </div>
  );
};

export default TopicMenuItem;
