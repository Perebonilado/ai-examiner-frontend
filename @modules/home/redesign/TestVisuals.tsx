import React, { FC, PropsWithChildren } from "react";
import cn from "classnames";
import { Eye, Play } from "lucide-react";

/* Small, still pictures of the real test screens, for the Smart tests list and the FAQ. They are
   decorative (the text beside them says the same thing), so the panel hides them from screen
   readers. Colours are the app's light theme. */

/** The cream panel a picture sits on. */
export const VisualPanel: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div aria-hidden="true" className={cn("rounded-[20px] bg-[var(--hcream)] px-4 py-6 sm:px-8", className)}>
    {children}
  </div>
);

/** A white app card inside the panel. */
export const MockCard: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div
    className={cn(
      "mx-auto max-w-[400px] rounded-[14px] bg-white p-4 font-[family-name:var(--font-sans)] shadow-[0_10px_24px_-14px_rgba(14,14,16,0.35)]",
      className
    )}
  >
    {children}
  </div>
);

const Question: FC<PropsWithChildren> = ({ children }) => (
  <p className="text-[13.5px] font-semibold leading-[1.45] text-[#0b0b0c]">{children}</p>
);

const Option: FC<{ letter: string; text: string; chosen?: boolean }> = ({ letter, text, chosen }) => (
  <div
    className={cn(
      "flex items-center gap-2.5 rounded-[10px] border-[1.5px] px-2.5 py-2 text-[13px]",
      chosen ? "border-[#7c3aed] bg-[#f5f3ff] font-semibold text-[#4c1d95]" : "border-[#ececef] text-[#33333b]"
    )}
  >
    <span
      className={cn(
        "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md text-[11px] font-bold",
        chosen ? "bg-[#7c3aed] text-white" : "bg-[#f1f1f3] text-[#6b6b74]"
      )}
    >
      {letter}
    </span>
    {text}
  </div>
);

/** 01 · A question with four options, one picked. */
export const McqVisual: FC = () => (
  <MockCard>
    <Question>Which chamber pumps blood into the aorta?</Question>
    <div className="mt-3 flex flex-col gap-1.5">
      <Option letter="A" text="Right atrium" />
      <Option letter="B" text="Left ventricle" chosen />
      <Option letter="C" text="Right ventricle" />
      <Option letter="D" text="Left atrium" />
    </div>
  </MockCard>
);

const TF_ROWS: { text: string; pick: boolean }[] = [
  { text: "S1 marks the start of systole", pick: true },
  { text: "S2 is loudest at the apex", pick: false },
  { text: "S2 splits on breathing in", pick: true },
];

/** 02 · One stem, a few statements, a True / False choice on each. */
export const TrueFalseVisual: FC = () => (
  <MockCard>
    <Question>Concerning the heart sounds:</Question>
    <div className="mt-2 divide-y divide-[#ececef]">
      {TF_ROWS.map((r) => (
        <div key={r.text} className="flex items-center gap-3 py-2.5">
          <span className="flex-1 text-[13px] leading-[1.4] text-[#0b0b0c]">{r.text}</span>
          {[true, false].map((v) => (
            <span
              key={String(v)}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border-[1.5px] text-[12px] font-bold",
                r.pick === v ? "border-[#7c3aed] bg-[#7c3aed] text-white" : "border-[#c9c9d1] text-[#6b6b74]"
              )}
            >
              {v ? "T" : "F"}
            </span>
          ))}
        </div>
      ))}
    </div>
  </MockCard>
);

/** 03 · A flashcard on top of its deck, question side up. */
export const FlashcardVisual: FC = () => (
  <div className="relative isolate mx-auto max-w-[360px] pb-3.5">
    <span className="absolute inset-x-[30px] bottom-0 -z-20 h-12 rounded-b-[16px] border border-t-0 border-[#e3e3e8] bg-[#f7f7f8]" />
    <span className="absolute inset-x-[15px] bottom-[7px] -z-10 h-12 rounded-b-[16px] border border-t-0 border-[#e3e3e8] bg-white" />
    <MockCard className="flex min-h-[176px] flex-col items-center justify-between !p-4 text-center">
      <span className="self-start text-[11.5px] font-medium text-[#6b6b74]">Card 3 of 20</span>
      <p className="max-w-[24ch] text-[17px] font-bold leading-[1.35] tracking-[-0.02em] text-[#0b0b0c]">
        Which valves closing makes the second heart sound?
      </p>
      <span className="inline-flex h-9 items-center gap-1.5 rounded-[9px] bg-[#f5f3ff] px-4 text-[12.5px] font-semibold text-[#4c1d95]">
        <Eye size={14} strokeWidth={1.9} />
        Show answer
      </span>
    </MockCard>
  </div>
);

/** 04 · A short patient scenario, then a question that asks you to apply what you know. */
export const CaseStudyVisual: FC = () => (
  <MockCard>
    <span className="inline-block rounded-md bg-[#fbf1cc] px-2 py-[3px] text-[11px] font-bold text-[#6b4e00]">Case</span>
    <p className="mt-2 text-[13px] leading-[1.55] text-[#33333b]">
      A 68-year-old man gets breathless lying flat. You hear an extra sound just after S2.
    </p>
    <div className="mt-3">
      <Question>What is the most likely cause?</Question>
    </div>
    <div className="mt-2.5 flex flex-col gap-1.5">
      <Option letter="A" text="Normal splitting of S2" />
      <Option letter="B" text="Heart failure (S3)" chosen />
    </div>
  </MockCard>
);

/** 05 · An essay question as the test shows it, with the answer half written. */
export const EssayVisual: FC = () => (
  <MockCard>
    <p className="text-[11.5px] font-medium tabular-nums text-[#6b6b74]">2 of 5</p>
    <p className="mt-1 text-[14px] font-semibold leading-[1.5] tracking-[-0.01em] text-[#0b0b0c]">
      Explain how the heart sounds relate to the cardiac cycle.
    </p>
    <div className="mt-3 rounded-[10px] border border-[#7c3aed] px-3 py-2.5 text-[12.5px] leading-[1.65] text-[#0b0b0c] shadow-[0_0_0_4px_rgba(124,58,237,0.14)]">
      S1 is heard as the ventricles start to contract and the AV valves close. S2 follows when the semilunar valves
      close at the end of systole
      <span className="ml-px inline-block h-[14px] w-px translate-y-[2px] bg-[#0b0b0c]" />
    </div>
  </MockCard>
);

const VIVA_ITEMS = [
  { n: 1, q: "What causes the first heart sound?", score: 8, pass: true },
  { n: 2, q: "When can a third heart sound be normal?", score: 4, pass: false },
];

/** 06 · After a viva: play the conversation back, then see each question the examiner asked,
 *  scored out of 10. */
export const VivaVisual: FC = () => (
  <MockCard className="!p-3">
    <div className="flex items-center gap-3 rounded-[12px] border border-[#e3e3e8] px-3 py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5b2ad6] text-white">
        <Play size={14} strokeWidth={2} fill="currentColor" className="translate-x-px" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-[#0b0b0c]">Play conversation</p>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="relative h-1.5 flex-1 rounded-full bg-[#ececef]">
            <span className="absolute inset-y-0 left-0 w-[34%] rounded-full bg-[#5b2ad6]" />
            <span className="absolute left-[34%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#5b2ad6] shadow-[0_1px_3px_rgba(14,14,16,0.3)]" />
          </span>
          <span className="text-[11px] tabular-nums text-[#6b6b74]">1:24 / 4:12</span>
        </div>
      </div>
    </div>
    <div className="mt-2 flex flex-col">
      {VIVA_ITEMS.map((it) => (
        <div key={it.n} className="flex items-start gap-2.5 border-b border-[#ececef] px-1 py-2.5 last:border-b-0">
          <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] bg-[#5b2ad6] text-[11px] font-bold text-white">
            AI
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6b6b74]">
              <b className="font-bold text-[#0b0b0c]">Examiner</b>
              <span className="inline-block h-2.5 w-px bg-[#d9d9de]" />
              <span className="tabular-nums">Question {it.n} of 6</span>
            </span>
            <span className="mt-0.5 block text-[13px] font-semibold leading-[1.4] text-[#0b0b0c]">{it.q}</span>
          </span>
          <span
            className={cn(
              "mt-0.5 inline-flex h-[22px] shrink-0 items-center rounded-full px-2 text-[12px] font-bold tabular-nums",
              it.pass ? "bg-[#ecfaf2] text-[#0d5c38]" : "bg-[#fef3f2] text-[#8f1d14]"
            )}
          >
            {it.score}
            <small className="text-[10.5px] font-medium">/10</small>
          </span>
        </div>
      ))}
    </div>
  </MockCard>
);
