import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  isActive: boolean;
  handleClick: (title: string) => void;
}

const TabItem: FC<Props> = ({ isActive, title, handleClick }) => {
  const baseStyling = cn(`font-medium px-16 py-2 max-md:px-8`, {
    "border-b-[3px] border-b-[#360B58]": isActive,
  });
  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        handleClick(title);
      }}
    >
      <p className={baseStyling}>{title}</p>
    </div>
  );
};

export default TabItem;
