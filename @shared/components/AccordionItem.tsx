import React, { FC } from "react";
import cn from "classnames";
import ChevronDown from "@/icons/ChevronDown";

interface Props {
  id: number;
  body: string;
  title: string;
  isOpen: boolean;
  handleClick: (id: number) => void;
}

const AccordionItem: FC<Props> = ({ id, body, title, isOpen, handleClick }) => {
  const expandBoxStyling = cn(
    "transition-max-h duration-500 ease-in-out overflow-hidden",
    {
      "max-h-[1000px] ": isOpen,
      "max-h-0": !isOpen,
    }
  );

  const chevronContainerStyling = cn(
    "duration-300 transition-rotate ease-in-out",
    {
      "rotate-180": isOpen,
    }
  );

  return (
    <div
      className="border border-black bg-white rounded-xl cursor-pointer"
      onClick={() => {
        handleClick(id);
      }}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <p className="text-lg font-medium max-md:text-base">{title}</p>
        <div className={chevronContainerStyling}>
          <ChevronDown />
        </div>
      </div>
      <div className={expandBoxStyling}>
        <p className="p-4 pt-0 text-base">{body}</p>
      </div>
    </div>
  );
};

export default AccordionItem;
