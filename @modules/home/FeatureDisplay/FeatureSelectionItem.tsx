import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  isActive: boolean;
  onActive: (title: string) => void;
}

const FeatureSelectionItem: FC<Props> = ({ isActive, title, onActive }) => {
  const classNames = cn(`h-[58px] text-sm px-12 rounded-[60px] min-w-fit`, {
    ["text-white bg-[#2F004F]"]: isActive,
    ["text-black"]: !isActive,
  });
  return (
    <button
      className={classNames}
      onClick={() => {
        onActive(title);
      }}
    >
      {title}
    </button>
  );
};

export default FeatureSelectionItem;
