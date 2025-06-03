import { capitalizeFirstLetterOfEachWord } from "@/utils";
import Link from "next/link";
import React, { FC, useEffect, useRef, useState } from "react";

export interface IRecentDocumentItem {
  link: string;
  title: string;
  callbackOnClick?: () => void;
}

const RecentDocumentItem: FC<IRecentDocumentItem> = ({ title, callbackOnClick, link }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setIsOverflowing(true);
    } else {
      setIsOverflowing(false);
    }
  }, [title]);

  return (
    <Link href={link}>
      <button
        onClick={() => {
          if (callbackOnClick) callbackOnClick();
        }}
        className="relative text-xs max-w-[200px] overflow-hidden whitespace-nowrap"
      >
        <span ref={textRef} className="block pr-6 text-white">
          {capitalizeFirstLetterOfEachWord(title.toLowerCase())}
        </span>

        {isOverflowing && (
          <span className="pointer-events-none absolute right-0 top-0 h-full w-7 bg-gradient-to-l from-[#360B58] to-[#FFFFFF00]" />
        )}
      </button>
    </Link>
  );
};

export default RecentDocumentItem;
