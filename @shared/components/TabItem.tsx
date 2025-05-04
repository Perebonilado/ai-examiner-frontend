// components/TabItem.tsx
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  isActive: boolean;
  handleClick: (title: string) => void;
}

const TabItem: FC<Props> = ({ isActive, title, handleClick }) => {
  const baseStyling = cn(
    "font-medium px-16 py-2 max-md:px-8 whitespace-nowrap transition-colors duration-300",
    {
      "text-[#360B58]": isActive,
      "border-b-[3px] border-b-[#360B58]": isActive,
    }
    // Removed the border styling since we're using the animated indicator
  );

  return (
    <div className="cursor-pointer" onClick={() => handleClick(title)} data-title={title}>
      <p className={baseStyling}>{title}</p>
    </div>
  );
};

export default TabItem;