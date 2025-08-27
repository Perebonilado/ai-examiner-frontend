import ArrowStubRightIcon from "@/icons/ArrowStubRightIcon";
import React, { FC, useState } from "react";
import cn from "classnames";

interface Props {
  startPage: number;
  endPage: number;
  title: string;
  shortDescription: string;
  isRead?: boolean;
}

const TopicItem: FC<Props> = ({
  endPage,
  shortDescription,
  startPage,
  title,
  isRead = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className={cn("border-b border-b-gray-200 flex flex-col gap-1")}>
      {/* Header Row */}
      <div className="p-4 pb-4 flex items-center justify-between gap-4">
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
        <button
          onClick={() => setIsChecked(!isChecked)}
          className={cn(
            "w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border border-gray-300 transition-colors duration-200",
            isChecked
              ? "bg-[#9333EA] border-[#9333EA]"
              : "bg-white hover:border-[#9333EA]"
          )}
        >
          {isChecked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="3"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
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
