import ArrowStubRightIcon from "@/icons/ArrowStubRightIcon";
import React, { FC, useState } from "react";
import cn from "classnames";
import CheckboxAlt from "@/@shared/ui/Input/Checkbox/CheckboxAlt";

interface Props {
  startPage: number;
  endPage: number;
  title: string;
  id: number;
  shortDescription: string;
  isRead: boolean;
  handleCheck: (id: number) => void;
  isChecked: boolean;
}

const TopicItem: FC<Props> = ({
  endPage,
  shortDescription,
  startPage,
  title,
  isRead,
  handleCheck,
  isChecked,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn("border-b border-b-gray-200 flex flex-col gap-1", {
        ["bg-gray-100"]: isRead,
      })}
    >
      {/* Header Row */}
      <div className={cn("p-4 pb-4 flex items-center justify-between gap-4")}>
        {/* Expand Button */}
        <button
          className="flex items-start gap-2 flex-1 min-w-0" // min-w-0 allows truncate to work
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Arrow vertically aligned with title */}
          <span
            className={cn(
              "transition-transform duration-300 mt-[4px]",
              isOpen && "rotate-90"
            )}
          >
            <ArrowStubRightIcon />
          </span>
          {/* Text container with ellipsis */}
          <div className="flex flex-col">
            <p
              className={cn("font-bold m-0 leading-tight text-left truncate ", {
                ["text-[#8B8B8B]"]: isRead,
              })}
            >
              {startPage === endPage
                ? `Page ${startPage}`
                : `Pages ${startPage} - ${endPage}`}
            </p>
            <p className="text-[#8B8B8B] text-sm m-0 mt-2 leading-snug truncate text-left">
              {title}
            </p>
          </div>
        </button>

        {/* Checkbox */}
        <CheckboxAlt
          handleCheck={() => {
            handleCheck(id);
          }}
          isChecked={isChecked}
        />
      </div>

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="m-0 px-4 py-2 pl-8 -mt-2">
            <p className="text-sm">{shortDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicItem;
