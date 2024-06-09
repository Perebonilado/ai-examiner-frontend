import React, { FC, useState } from "react";
import cn from "classnames";
import ChevronRight from "@/icons/ChevronRight";
import CourseDocumentIcon from "@/icons/CourseDocumentIcon";
import Link from "next/link";
import { capitalizeFirstLetterOfEachWord } from "@/utils";

interface Props {
  title: string;
  data?: {
    title: string;
    link: string;
  }[];
  callbackOnClick?: () => void;
}

const ExpandableSidebarItem: FC<Props> = ({ title, data, callbackOnClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const expandBoxStyling = cn(
    "transition-max-h duration-500 ease-in-out overflow-hidden pl-8"
  );

  const chevronOrientationStyling = cn(
    `transition-all duration-300 ease-in-out`,
    {
      "rotate-90": isOpen,
    }
  );

  return (
    <div>
      <div
        className="flex items-center gap-3 cursor-pointer pr-2 pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="font-semibold text-sm text-white pl-8">{title}</p>
      </div>

      <div className={expandBoxStyling}>
        {data?.map((t, idx) => (
          <div className="flex items-center gap-3 cursor-pointer" key={idx}>
            <Link href={t.link}>
              <p
                onClick={() => {
                  if (callbackOnClick) callbackOnClick();
                }}
                className="py-1 text-sm text-gray-300 hover:text-white"
              >
                {capitalizeFirstLetterOfEachWord(t.title.toLowerCase())}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandableSidebarItem;
