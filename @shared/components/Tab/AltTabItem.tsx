import React, { FC } from "react";
import cn from "classnames";

export interface IAltTabItem {
  handleClick: (title: string) => void;
  title: string;
  isActive: boolean;
}

const AltTabItem: FC<IAltTabItem> = ({ handleClick, isActive, title }) => {
  const rootClassName = cn(`px-4 py-3 text-xs`, {
    ["bg-[#9333EA] text-white"]: isActive,
    ["bg-gray-200 text-[#000000]"]: !isActive,
  });
  return (
    <button
      className={rootClassName}
      type="button"
      onClick={() => {
        handleClick(title);
      }}
    >
      <span>{title}</span>
    </button>
  );
};

export default AltTabItem;
