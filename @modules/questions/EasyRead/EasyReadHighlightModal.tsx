import React, { FC } from "react";
import { BookA, Highlighter, Image as ImageIcon, Layers, Lightbulb, Sparkles, X } from "lucide-react";
import Button from "@/@shared/ui/Button";

interface Props {
  handleClose: () => void;
}

const BAR_ACTIONS = [
  { label: "Explain", Icon: Lightbulb },
  { label: "Simplify", Icon: Sparkles },
  { label: "Define", Icon: BookA },
  { label: "Visualize", Icon: ImageIcon },
];

/** First visit to Easy Read: how highlighting works. */
const EasyReadHighlightModal: FC<Props> = ({ handleClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="easy-read-intro-title"
      className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-surface shadow-pop max-md:max-w-[calc(100%-32px)]"
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
      >
        <X size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <div className="px-6 pb-6 pt-6 max-sm:px-5">
        <p className="text-[12px] font-semibold text-muted">Easy Read</p>
        <h2 id="easy-read-intro-title" className="mt-1 text-xl font-bold text-ink">
          Learn with confidence
        </h2>

        {/* A small, flat preview of highlighting text */}
        <div aria-hidden="true" className="mt-5 rounded-xl border border-line bg-sunken px-4 pb-4 pt-4">
          <p className="text-[13px] leading-[1.7] text-body">
            <span className="rounded-[2px] bg-[rgba(124,58,237,.18)]">
              The plateau keeps the ventricle refractory
            </span>{" "}
            while it contracts.
          </p>
          <div className="mt-2.5 flex w-full gap-0.5 rounded-[10px] bg-ink p-1 sm:inline-flex sm:w-auto">
            {BAR_ACTIONS.map(({ label, Icon }, i) => (
              <span
                key={label}
                className={`flex h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[11px] font-semibold text-white sm:h-7 sm:flex-none sm:flex-row sm:gap-1.5 sm:px-2 sm:text-[12px] ${
                  i === 0 ? "bg-white/[.12]" : ""
                }`}
              >
                <Icon size={13} strokeWidth={1.75} className="shrink-0 text-accent-300" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-3.5">
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sunken text-subtle">
              <Highlighter size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="text-[14px] leading-[1.55] text-body">
              Highlight any text to get explanations, simplifications, definitions
              and even images to support you while studying.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sunken text-subtle">
              <Layers size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="text-[14px] leading-[1.55] text-body">
              Store new words in your deck to create flashcards manually.
            </p>
          </li>
        </ul>
      </div>

      <div className="flex justify-end border-t border-line bg-canvas px-6 py-3.5 max-sm:px-5">
        <Button title="Got it" onClick={handleClose} className="max-sm:w-full" />
      </div>
    </div>
  );
};

export default EasyReadHighlightModal;
