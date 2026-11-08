import { capitalizeFirstLetterOfEachWord } from "@/utils";
import Link from "next/link";
import React, { FC } from "react";
import { FileText } from "lucide-react";
import cn from "classnames";

export interface IRecentDocumentItem {
  link: string;
  title: string;
  isActive?: boolean;
  callbackOnClick?: () => void;
}

const RecentDocumentItem: FC<IRecentDocumentItem> = ({
  title,
  callbackOnClick,
  link,
  isActive = false,
}) => {
  const label = capitalizeFirstLetterOfEachWord(title.toLowerCase());

  return (
    <Link
      href={link}
      title={label}
      aria-current={isActive ? "page" : undefined}
      onClick={() => callbackOnClick?.()}
      className={cn(
        "group flex h-[34px] items-center gap-2.5 rounded-lg pl-2.5 pr-1.5 text-[13px] transition-colors",
        isActive
          ? "bg-hover font-medium text-ink"
          : "text-body hover:bg-hover hover:text-ink"
      )}
    >
      <FileText
        size={15}
        strokeWidth={1.6}
        aria-hidden="true"
        className={cn(
          "shrink-0",
          isActive ? "text-ink" : "text-faint group-hover:text-ink"
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
};

export default RecentDocumentItem;
