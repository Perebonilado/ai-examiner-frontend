import { RootState } from "@/config/redux-config";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import cn from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import ToolTip from "../ToolTip";

interface Props {
  title: string;
  isActive: boolean;
  link: string;
  icon: React.ReactNode;
  showTextByDefault?: boolean | null;
  callBackOnClick?: () => void;
}

const CollapsibleButton: FC<Props> = ({
  title,
  isActive,
  link,
  icon,
  callBackOnClick,
  showTextByDefault = null
}) => {
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );
  const router = useRouter();
  return (
    <button
      id={title}
      className={cn(
        "relative flex items-center px-2 w-full transition-all duration-300 h-[45px]",
        {
          ["bg-[#F2E1FF] !text-[#2F004F] rounded-md"]: isActive,
          ["!text-white"]: !isActive,
        }
      )}
      onClick={() => {
        router.push(link);
        if (!!callBackOnClick) callBackOnClick();
      }}
    >
      {/* Icon wrapper with fixed width */}
      <span className="w-4 flex justify-center items-center">
        {!isOpen ? (
          <ToolTip id={title} message={title}>
            {icon}
          </ToolTip>
        ) : (
          icon
        )}
      </span>

      {/* Text transition wrapper */}
      <span
        className={cn("ml-3 origin-left transition-all duration-300 text-sm", {
          "opacity-100 scale-x-100": showTextByDefault ?? isOpen,
          "opacity-0 scale-x-0": showTextByDefault ?? !isOpen,
        })}
        style={{ transitionProperty: "opacity, transform" }}
      >
        {title}
      </span>
    </button>
  );
};

export default CollapsibleButton;
