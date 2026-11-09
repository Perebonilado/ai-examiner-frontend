import React, { FC, useId, useState } from "react";
import cn from "classnames";
import { Check } from "lucide-react";
import { DocumentTopicv2DTO } from "@/dto/document-topic.dto";
import TopicCheckbox from "./TopicCheckbox";

/** read: done · next: the first unread topic (an accent ring on the path) · todo: the rest. */
export type TopicStatus = "read" | "next" | "todo";

interface Props {
  topic: DocumentTopicv2DTO;
  status: TopicStatus;
  isFirst: boolean;
  isLast: boolean;
  /** The line from the topic above is green (both read, or a read topic leading into "next"). */
  lineAboveDone: boolean;
  /** The line to the topic below is green. */
  lineBelowDone: boolean;
  isChecked: boolean;
  handleCheck: (id: number) => void;
}

const sentenceCase = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

const pageLabel = (start: number, end: number) =>
  start === end ? `p. ${start}` : `pp. ${start}–${end}`;

/** Where the node sits on the path, from the row's top (px): the middle of the title's line. */
const NODE_CENTER = 22;

const Node: FC<{ status: TopicStatus }> = ({ status }) => {
  if (status === "read") {
    return (
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-success text-white">
        <Check size={11} strokeWidth={3.5} />
      </span>
    );
  }
  if (status === "next") {
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full border-[3px] border-accent bg-surface">
        <span className="h-[6px] w-[6px] rounded-full bg-accent" />
      </span>
    );
  }
  return <span className="h-3.5 w-3.5 rounded-full border-2 border-control bg-surface" />;
};

/**
 * The reading path: a line through every topic. A stretch is green only where it joins two read
 * topics (or leads from the last one read into "next"), so topics read out of order stand alone.
 */
const Path: FC<{
  status: TopicStatus;
  center: number;
  isFirst: boolean;
  isLast: boolean;
  lineAboveDone: boolean;
  lineBelowDone: boolean;
}> = ({ status, center, isFirst, isLast, lineAboveDone, lineBelowDone }) => (
  <div aria-hidden="true" className="relative w-5 shrink-0 self-stretch">
    {!isFirst && (
      <span
        className={cn("absolute left-[9px] top-0 w-0.5", lineAboveDone ? "bg-success-line" : "bg-line")}
        style={{ height: center }}
      />
    )}
    {!isLast && (
      <span
        className={cn(
          "absolute bottom-0 left-[9px] w-0.5",
          lineBelowDone ? "bg-success-line" : "bg-line"
        )}
        style={{ top: center }}
      />
    )}
    <span
      className="absolute left-0 flex w-5 -translate-y-1/2 justify-center"
      style={{ top: center }}
    >
      <Node status={status} />
    </span>
  </div>
);

/**
 * One topic on the reading path: its node, title (click to open the description), page range and
 * checkbox. Selected topics get their actions from the floating selection bar.
 */
const TopicItem: FC<Props> = ({
  topic,
  status,
  isFirst,
  isLast,
  lineAboveDone,
  lineBelowDone,
  isChecked,
  handleCheck,
}) => {
  const { id, title, startPage, endPage, shortDescription } = topic;
  const [isOpen, setIsOpen] = useState(false);
  const descriptionId = useId();
  const name = sentenceCase(title);
  const read = status === "read";
  return (
    <li className="group flex gap-3 px-5">
      <Path
        status={status}
        center={NODE_CENTER}
        isFirst={isFirst}
        isLast={isLast}
        lineAboveDone={lineAboveDone}
        lineBelowDone={lineBelowDone}
      />
      <div
        className={cn("flex min-w-0 flex-1 items-start gap-3 py-3", {
          "border-b border-line": !isLast,
        })}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={shortDescription ? isOpen : undefined}
          aria-controls={shortDescription ? descriptionId : undefined}
          className="min-w-0 flex-1 text-left"
        >
          <span
            className={cn(
              "block text-[14px] font-medium leading-5 transition-colors",
              read ? "text-muted group-hover:text-body" : "text-ink"
            )}
          >
            {read && <span className="sr-only">Read: </span>}
            {status === "next" && <span className="sr-only">Up next: </span>}
            {name}
          </span>
          {shortDescription && (
            <span
              id={descriptionId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out-expo motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <span className="overflow-hidden">
                <span className="block pt-1.5 text-[13px] leading-[1.55] text-subtle">
                  {shortDescription}
                </span>
              </span>
            </span>
          )}
        </button>
        <span className="shrink-0 text-xs leading-5 tabular-nums text-muted">
          {pageLabel(startPage, endPage)}
        </span>
        <TopicCheckbox
          className="mt-0.5"
          checked={isChecked}
          onChange={() => handleCheck(id)}
          label={`Select ${name}`}
        />
      </div>
    </li>
  );
};

export default TopicItem;
