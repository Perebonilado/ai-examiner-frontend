import React, { FC, useId, useState } from "react";
import cn from "classnames";
import { Check } from "lucide-react";
import TopicCheckbox from "./TopicCheckbox";

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

const sentenceCase = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

/** One topic row: checkbox, page range, title; clicking the row shows its description. */
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
  const descriptionId = useId();
  const pages =
    startPage === endPage ? `Page ${startPage}` : `Pages ${startPage} – ${endPage}`;

  return (
    <li
      className={cn(
        "flex gap-3 border-b border-line px-5 py-3.5 transition-colors",
        isOpen ? "bg-accent-50" : "hover:bg-canvas"
      )}
    >
      <TopicCheckbox
        className="mt-0.5"
        checked={isChecked}
        onChange={() => handleCheck(id)}
        label={`Select ${title}`}
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={shortDescription ? isOpen : undefined}
        aria-controls={shortDescription ? descriptionId : undefined}
        className="min-w-0 flex-1 text-left"
      >
        <span
          className={cn(
            "flex items-center text-xs font-bold tabular-nums",
            isRead ? "text-faint" : "text-ink"
          )}
        >
          {pages}
          {isRead && (
            <span className="ml-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              Read
            </span>
          )}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[13.5px] leading-[1.4]",
            isRead ? "text-faint" : "text-body"
          )}
        >
          {sentenceCase(title)}
        </span>

        {shortDescription && (
          <span
            id={descriptionId}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out-expo",
              isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <span className="overflow-hidden">
              <span className="block pt-2 text-[13px] leading-[1.55] text-subtle">
                {shortDescription}
              </span>
            </span>
          </span>
        )}
      </button>
    </li>
  );
};

export default TopicItem;
