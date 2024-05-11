import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import ChevronRight from "@/icons/ChevronRight";
import CourseDocumentIcon from "@/icons/CourseDocumentIcon";

interface Props {
  title: string;
}

const ExpandableSidebarItem: FC<Props> = ({ title }) => {
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

  useEffect(() => {
    console.log(isOpen);
  }, [isOpen]);

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
        {["test", "test2", "test4"].map((t) => (
          <div className="flex items-center gap-3 pl-8 cursor-pointer">
            <CourseDocumentIcon />
            <p className="py-1">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandableSidebarItem;
