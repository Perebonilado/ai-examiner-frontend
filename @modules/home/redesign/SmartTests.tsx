import Link from "next/link";
import React, { FC, ReactNode, useId, useState } from "react";
import cn from "classnames";
import { Plus, X } from "lucide-react";
import {
  CaseStudyVisual,
  EssayVisual,
  FlashcardVisual,
  McqVisual,
  TrueFalseVisual,
  VisualPanel,
  VivaVisual,
} from "./TestVisuals";

const TESTS: { title: string; body: string; visual: ReactNode }[] = [
  {
    title: "MCQ’s",
    body: "Instantly generated from your uploaded files, these questions challenge learners to think critically while reinforcing key concepts.",
    visual: <McqVisual />,
  },
  {
    title: "Multiple true-false",
    body: "Each question comes with a set of statements to mark true or false, the way many medical and science papers set them.",
    visual: <TrueFalseVisual />,
  },
  {
    title: "Flashcards",
    body: "Perfect for on-the-go reviews or quick study sessions, flashcards provide a proven way to enhance retention.",
    visual: <FlashcardVisual />,
  },
  {
    title: "Case studies",
    body: "These question formats go beyond rote memorization; they encourage learners to apply theoretical knowledge to practical scenarios.",
    visual: <CaseStudyVisual />,
  },
  {
    title: "Essay",
    body: "Perfect for developing critical thinking and deeper analysis, essay questions let you demonstrate your understanding and express ideas in a clear, structured, and comprehensive way.",
    visual: <EssayVisual />,
  },
  {
    title: "Oral (Viva)",
    body: "Oral viva assessments offer a dynamic evaluation method where learners verbally present their knowledge and understanding of a subject. Learners are able to playback their test conversations and evaluate their performance with valuable AI-driven insights.",
    visual: <VivaVisual />,
  },
];

const SmartTests: FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <section id="how-it-works" aria-labelledby={`${id}-h`} className="mx-auto max-w-[1052px] px-4 pt-[78px] lg:px-10 min-[1132px]:px-0 lg:pt-[110px]">
      <div className="lg:flex lg:items-start lg:justify-between">
        <div>
          <h2 id={`${id}-h`} className="text-[34.5px] font-semibold leading-[1.13] text-[var(--hk)] lg:text-[44px] lg:leading-[1.13]">
            <span className="text-[var(--hp)]">Smart tests</span>
            <br />
            to boost
            <br />
            your grades
          </h2>
          <Link
            href="/auth/login"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-[var(--hp)] px-[22px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--hp-hover)] lg:mt-[31px]"
          >
            Get started for free
          </Link>
        </div>

        <ul className="mt-10 border-t border-[#eaeaed] lg:mt-0 lg:w-[544px]">
          {TESTS.map((t, i) => {
            const isOpen = open === i;
            return (
              <li key={t.title} className="border-b border-[#eaeaed]">
                <h3>
                  <button
                    type="button"
                    id={`${id}-b${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-p${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center py-5 text-left lg:py-[23px]"
                  >
                    <span
                      className={cn(
                        "w-8 shrink-0 text-[13px] font-medium tabular-nums lg:w-[39px]",
                        isOpen ? "text-[var(--hp)]" : "text-[#62626b]"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[18.5px] font-semibold leading-[29px] text-[var(--hk)] transition-colors group-hover:text-[var(--hp)] lg:text-[21.5px] lg:leading-[28px]">
                      {t.title}
                    </span>
                    {isOpen ? (
                      <X size={17} strokeWidth={2.2} className="mr-[1px] text-[var(--hp)]" aria-hidden />
                    ) : (
                      <Plus size={18} strokeWidth={1.8} className="text-[#95959d]" aria-hidden />
                    )}
                  </button>
                </h3>
                <div
                  id={`${id}-p${i}`}
                  role="region"
                  aria-labelledby={`${id}-b${i}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className={cn("overflow-hidden", !isOpen && "invisible")}>
                    <div className="pb-[26px] pl-8 lg:pl-[39px]">
                      <p className="pr-4 text-[14px] leading-[22px] text-[#3f3f47] lg:max-w-[460px] lg:pr-0 lg:leading-[21.5px]">
                        {t.body}
                      </p>
                      <VisualPanel className="mt-4">{t.visual}</VisualPanel>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default SmartTests;
