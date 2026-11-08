import Button from "@/@shared/ui/Button";
import { Lightbulb } from "lucide-react";
import React, { FC } from "react";

interface Props {
  hint: string;
  id?: string;
  handleClose: () => void;
}

/* Opens inside the flash card, above "Show answer", so the question stays in view. */
const HintCard: FC<Props> = ({ hint, id, handleClose }) => {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={id ? `${id}-title` : undefined}
      className="flex items-start gap-3 mb-[18px] py-3 pr-3 pl-3.5 rounded-[14px] bg-well text-left max-md:flex-wrap max-md:mb-3.5"
    >
      <span className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0 bg-warning-bg text-warning">
        <Lightbulb size={17} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="flex-1 min-w-0 max-md:basis-[calc(100%-44px)]">
        <h4
          id={id ? `${id}-title` : undefined}
          className="mt-1.5 text-sm font-bold leading-[1.4] text-ink"
        >
          Hint
        </h4>
        <p className="mt-0.5 text-sm leading-[1.6] text-body max-w-[56ch]">
          {hint}
        </p>
      </div>
      <Button
        title="Close"
        variant="outlined"
        size="small"
        onClick={handleClose}
        className="self-center max-md:w-full max-md:!h-10"
      />
    </div>
  );
};

export default HintCard;
