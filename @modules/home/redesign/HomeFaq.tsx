import React, { FC, ReactNode, useId, useState } from "react";
import cn from "classnames";
import { Check, Lightbulb, Plus, X } from "lucide-react";
import FileTypeTile, { FileTypeTileExt } from "@/@shared/components/FileTypeTile";
import { MockCard, VisualPanel } from "./TestVisuals";

/* ---------- the visuals: small, still pictures of the real product ---------- */

const FILE_TYPES: FileTypeTileExt[] = ["PDF", "DOCX", "PPTX", "PPT", "PNG", "JPG", "TXT"];
const TILT = [-6, -2, 3, -4, 2, -3, 5];

/** Every file type we take, fanned out like a pile of handouts. */
const FileTypesVisual: FC = () => (
  <div className="flex justify-center py-2">
    {FILE_TYPES.map((ext, i) => (
      <span
        key={ext}
        style={{ transform: `rotate(${TILT[i]}deg)`, zIndex: i }}
        className="relative -ml-1.5 drop-shadow-[0_6px_8px_rgba(14,14,16,0.14)] first:ml-0 sm:ml-3 sm:first:ml-0"
      >
        <FileTypeTile ext={ext} size="hero" labelClassName="font-[family-name:var(--font-home-round)]" />
      </span>
    ))}
  </div>
);

const TOPICS = [
  { title: "Heart sounds", pages: "Pages 2 - 4", on: true },
  { title: "The cardiac cycle", pages: "Pages 5 - 8", on: false },
  { title: "ECG basics", pages: "Pages 9 - 12", on: true },
  { title: "Heart failure", pages: "Pages 13 - 15", on: false },
];

/** The topic picker as it looks in the app: topics found in the upload, two of them chosen. */
const TopicsVisual: FC = () => (
  <MockCard className="!p-2">
    <p className="px-2 pb-2 pt-1 text-[12px] font-semibold text-[#6b6b74]">
      Topics in <span className="text-[#0b0b0c]">Cardiology notes.pdf</span>
    </p>
    <div className="flex flex-col gap-1">
      {TOPICS.map((t) => (
        <div
          key={t.title}
          className={cn(
            "flex items-baseline gap-3 rounded-[10px] border-[1.5px] px-3 py-2.5",
            t.on ? "border-[#7c3aed] bg-[#f5f3ff]" : "border-transparent"
          )}
        >
          <span className="flex-1 text-[13px] font-medium text-[#0b0b0c]">{t.title}</span>
          <span className="whitespace-nowrap text-[12px] tabular-nums text-[#6b6b74]">{t.pages}</span>
        </div>
      ))}
    </div>
    <p className="mt-2 border-t border-dashed border-[#ececef] px-2 pb-1 pt-2 text-[12px] font-medium text-[#6b6b74]">
      2 topics selected
    </p>
  </MockCard>
);

/** A question answered wrong, as the test shows it after you submit: your answer, the right one,
 *  and the explanation underneath. */
const ExplanationVisual: FC = () => (
  <MockCard>
    <p className="text-[13.5px] font-semibold leading-[1.45] text-[#0b0b0c]">
      Which valves closing makes the first heart sound (S1)?
    </p>
    <div className="mt-3 flex flex-col gap-1.5 text-[13px]">
      <div className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-[#b42318] bg-[#fef3f2] px-2.5 py-2 text-[#8f1d14]">
        <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-[#b42318] text-[11px] font-bold text-white">A</span>
        <span className="flex-1">Semilunar valves</span>
        <span className="flex items-center gap-1 text-[11px] font-bold">
          <X size={13} strokeWidth={2.5} aria-hidden /> Your answer
        </span>
      </div>
      <div className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-[#13794a] bg-[#ecfaf2] px-2.5 py-2 font-semibold text-[#0d5c38]">
        <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-[#13794a] text-[11px] font-bold text-white">B</span>
        <span className="flex-1">Atrioventricular valves</span>
        <span className="flex items-center gap-1 text-[11px] font-bold">
          <Check size={13} strokeWidth={2.5} aria-hidden /> Correct
        </span>
      </div>
    </div>
    <div className="mt-3 rounded-xl bg-[#f7f7f8] px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#0b0b0c]">
        <Lightbulb size={14} strokeWidth={1.9} className="text-[#7c3aed]" aria-hidden />
        Explanation
      </p>
      <p className="mt-1 text-[12.5px] leading-[1.6] text-[#33333b]">
        S1 comes from the mitral and tricuspid (atrioventricular) valves closing as the ventricles squeeze. The semilunar
        valves close later and make S2.
      </p>
    </div>
  </MockCard>
);

/* ---------- the questions ---------- */

const FAQS: { q: string; a: ReactNode; visual: ReactNode }[] = [
  {
    q: "What document types can I upload?",
    a: (
      <>
        Lecture notes, slides, textbooks, even photos of your notes.
        <span className="sr-only"> We take PDF, DOCX, PPTX, PPT, PNG, JPG and TXT files.</span>
      </>
    ),
    visual: <FileTypesVisual />,
  },
  {
    q: "Can I be quizzed on just a particular topic?",
    a: "Yes. We find the topics in your upload, and you pick one or as many as you like.",
    visual: <TopicsVisual />,
  },
  {
    q: "Will I get explanations to questions I get wrong?",
    a: "Yes. Every wrong answer comes with a short explanation of the right one.",
    visual: <ExplanationVisual />,
  },
];

const HomeFaq: FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  return (
    <section aria-labelledby={`${id}-h`} className="mx-auto max-w-[620px] px-4 pt-20 lg:px-0 lg:pt-[110px]">
      <h2 id={`${id}-h`} className="text-center text-[31px] font-semibold leading-[1.1] text-[var(--hk)] lg:text-[44px]">
        Frequently asked questions
      </h2>
      <ul className="mt-10 border-t border-[#1f1f23] lg:mt-[44px]">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={f.q} className="border-b border-[#1f1f23]">
              <h3>
                <button
                  type="button"
                  id={`${id}-b${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${id}-p${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-[16px] font-medium leading-[24px] text-[var(--hk)] transition-colors group-hover:text-[var(--hp)]">
                    {f.q}
                  </span>
                  <Plus
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden
                    className={cn("shrink-0 text-[var(--hk)] transition-transform duration-300 motion-reduce:transition-none", isOpen && "rotate-45 text-[var(--hp)]")}
                  />
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
                  <div className="pb-6">
                    <p className="text-[15.5px] leading-[24px] text-[#3f3f47]">{f.a}</p>
                    <VisualPanel className="mt-4">{f.visual}</VisualPanel>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default HomeFaq;
