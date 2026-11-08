import { capitalizeFirstLetterOfEachWord } from "@/utils";
import React, { ElementRef, FC, Fragment, useEffect, useRef, useState } from "react";
import MCQItemContainerPDF from "./MCQItemContainerPDF";
import { QuestionsModel } from "@/models/questions.model";
import { MoreHorizontal } from "lucide-react";
import cn from "classnames";

interface Props {
  /** Kept for compatibility: back now lives in the app shell's top bar / phone bar. */
  handleBack?: () => void;
  title: string;
  questions?: QuestionsModel[];
  handleCopyShareLink?: () => void;
  /** Meta line under the title, e.g. ["Multiple choice", "20 questions", "Submitted"]. */
  meta?: (string | null | undefined | false)[];
}

const TestPageTitle: FC<Props> = ({
  title,
  questions,
  handleCopyShareLink,
  meta,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<ElementRef<"div">>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const metaItems = (meta || []).filter(Boolean) as string[];

  return (
    <div data-test-head className="flex items-start justify-between gap-4 mb-5">
      <div className="min-w-0">
        <h1 className="text-[24px] max-md:text-xl leading-[1.25] font-bold text-ink tracking-[-0.015em] [text-wrap:balance]">
          {capitalizeFirstLetterOfEachWord(title)}
        </h1>
        {metaItems.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-subtle">
            {metaItems.map((item, idx) => (
              <Fragment key={idx}>
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className="w-[3px] h-[3px] rounded-full bg-faint opacity-50"
                  />
                )}
                <span>{item}</span>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {questions && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label="Share or download this test"
            title="Share or download"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "w-9 h-9 max-md:w-10 max-md:h-10 grid place-items-center rounded-lg border border-control bg-surface text-subtle hover:bg-hover hover:text-ink transition-colors",
              { ["!bg-hover !text-ink"]: isMenuOpen }
            )}
          >
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[190px] p-1.5 rounded-xl bg-surface border border-edge shadow-pop"
            >
              <MCQItemContainerPDF
                data={questions || []}
                title={capitalizeFirstLetterOfEachWord(title)}
                handleCopyShareLink={() => {
                  handleCopyShareLink && handleCopyShareLink();
                }}
                onAction={() => setIsMenuOpen(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestPageTitle;
