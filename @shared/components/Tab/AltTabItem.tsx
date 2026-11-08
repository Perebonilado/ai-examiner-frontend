import React, { FC } from "react";
import cn from "classnames";

export interface IAltTabItem {
  handleClick: (title: string) => void;
  title: string;
  isActive: boolean;
}

const AltTabItem: FC<IAltTabItem> = ({ handleClick, isActive, title }) => {
  const rootClassName = cn(`h-8 px-3.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors`, {
    ["bg-surface text-ink shadow-[0_1px_2px_rgba(16,12,40,.1),0_0_0_0.5px_rgba(16,12,40,.06)]"]: isActive,
    ["text-subtle hover:text-ink"]: !isActive,
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
