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
    "relative py-3 mr-6 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
    {
      "text-ink after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[2px] after:rounded after:bg-accent": isActive,
      "text-subtle hover:text-ink": !isActive
    }
  );

  return (
    <div className="cursor-pointer" onClick={() => handleClick(title)} data-title={title}>
      <p className={baseStyling}>{title}</p>
    </div>
  );
};

export default TabItem;