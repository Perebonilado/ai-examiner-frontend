import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import ChevronRight from "@/icons/ChevronRight";
import CourseDocumentIcon from "@/icons/CourseDocumentIcon";
import Link from "next/link";

interface Props {
  title: string;
  data?: {
    title: string;
    link: string;
  }[];
}

const ExpandableSidebarItem: FC<Props> = ({ title, data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const expandBoxStyling = cn(
    "transition-max-h duration-500 ease-in-out overflow-hidden px-4",
    {
      "max-h-[1000px] ": isOpen,
      "max-h-0": !isOpen,
    }
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
        className="flex items-center gap-3 cursor-pointer px-4 pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={chevronOrientationStyling}>
          <ChevronRight />
        </span>
        <p className="font-semibold text-sm">{title}</p>
      </div>

      <div className={expandBoxStyling}>
        {data?.map((t, idx) => (
          <div
            className="flex items-center gap-3 pl-8 cursor-pointer"
            key={idx}
          >
            <CourseDocumentIcon />
            <Link href={t.link}>
              <p className="py-2 text-xs">{t.title}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandableSidebarItem;
