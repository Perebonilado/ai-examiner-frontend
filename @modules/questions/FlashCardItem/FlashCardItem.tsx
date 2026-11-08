import Button from "@/@shared/ui/Button";
import React, { FC, useId, useState } from "react";
import cn from "classnames";
import { Eye, EyeOff, Lightbulb } from "lucide-react";
import HintCard from "../HintCard";
import { SpeechButtonWithProgress } from "@/@shared/components/SpeechButtonWithProgress";

interface Props {
  question: string;
  answer: string;
  hint?: string;
  index: number;
  total: number;
}

/* Hides a face from assistive tech and the tab order while it is turned away. */
const hiddenFace = (hidden: boolean) =>
  (hidden ? { "aria-hidden": true, inert: "" } : {}) as Record<string, unknown>;

const face =
  "[grid-area:1/1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] flex flex-col min-h-[420px] px-[18px] pt-4 pb-6 rounded-[20px] border border-control shadow-lift max-md:min-h-[380px] max-md:px-3 max-md:pt-3 max-md:pb-5 max-md:rounded-[18px]";

const FlashCardItem: FC<Props> = ({ question, answer, hint, index, total }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const hintId = `hint-${useId().replace(/:/g, "")}`;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative isolate [perspective:1600px]">
      {/* the rest of the deck, peeking out under the card */}
      <div
        aria-hidden
        className="absolute left-3.5 right-3.5 -bottom-[7px] h-12 -z-10 rounded-b-[18px] border border-t-0 border-edge bg-surface"
      />
      <div
        aria-hidden
        className="absolute left-[30px] right-[30px] -bottom-[14px] h-12 -z-20 rounded-b-[18px] border border-t-0 border-edge bg-well"
      />

      <div
        className={cn(
          "grid [transform-style:preserve-3d] transition-transform duration-500 ease-out-expo motion-reduce:transition-none",
          { "[transform:rotateY(180deg)]": isFlipped }
        )}
      >
        {/* Question side */}
        <article
          aria-label={`Card ${index + 1} of ${total}, question side`}
          className={cn(face, "bg-surface")}
          {...hiddenFace(isFlipped)}
        >
          <div className="flex items-center justify-between gap-2 min-h-9">
            {hint ? (
              <button
                type="button"
                aria-pressed={isHintOpen}
                aria-expanded={isHintOpen}
                aria-controls={hintId}
                onClick={() => setIsHintOpen(!isHintOpen)}
                className={cn(
                  "inline-flex items-center gap-[7px] h-8 px-2.5 rounded-lg text-[13px] font-semibold text-accent transition-colors hover:bg-accent-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-bright",
                  { "bg-accent-50": isHintOpen }
                )}
              >
                <Lightbulb size={16} strokeWidth={1.75} aria-hidden />
                Hint
              </button>
            ) : (
              <span />
            )}
            <div className="-my-1.5 -mr-1.5">
              <SpeechButtonWithProgress question={question} />
            </div>
          </div>

          <div className="flex-1 grid place-items-center px-7 py-5 text-center max-md:px-3 max-md:py-4">
            <p className="text-[25px] leading-[1.36] font-bold tracking-[-0.022em] text-ink max-w-[24ch] [text-wrap:balance] max-md:text-[21px]">
              {question}
            </p>
          </div>

          {hint && isHintOpen && (
            <HintCard
              id={hintId}
              hint={hint}
              handleClose={() => setIsHintOpen(false)}
            />
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleFlip}
              className="inline-flex items-center justify-center gap-2 h-12 min-w-[168px] px-[22px] rounded-[10px] bg-accent-50 text-accent-900 text-[15px] font-semibold transition-colors hover:bg-accent-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright max-md:w-full"
            >
              <Eye size={16} strokeWidth={1.75} aria-hidden />
              Show answer
            </button>
          </div>
        </article>

        {/* Answer side */}
        <article
          aria-label={`Card ${index + 1} of ${total}, answer side`}
          className={cn(face, "bg-rail [transform:rotateY(180deg)]")}
          {...hiddenFace(!isFlipped)}
        >
          <div className="flex items-center justify-end gap-2 min-h-9">
            <div className="-my-1.5 -mr-1.5">
              <SpeechButtonWithProgress question={answer} />
            </div>
          </div>

          <div className="flex-1 grid place-items-center px-7 py-5 text-center max-md:px-3 max-md:py-4">
            <p className="text-lg leading-[1.6] text-body max-w-[42ch] [text-wrap:pretty] max-md:text-base max-md:text-left">
              {answer}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              title="Hide answer"
              variant="outlined"
              size="large"
              starticon={<EyeOff size={16} strokeWidth={1.75} aria-hidden />}
              onClick={handleFlip}
              className="min-w-[168px] max-md:w-full"
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default FlashCardItem;
