import { ClipboardCheck } from "lucide-react";
import React, { FC } from "react";

interface Props {
  systemResponse: string;
}

const VivaSystemResponse: FC<Props> = ({ systemResponse }) => {
  return (
    <section
      aria-label="Evaluation"
      className="rounded-xl bg-well px-4 pt-3.5 pb-4 max-md:px-3.5 max-md:pt-3 max-md:pb-3.5"
    >
      <h4 className="flex items-center gap-2 text-[13px] font-bold text-ink">
        <ClipboardCheck
          size={16}
          strokeWidth={1.75}
          className="text-accent"
          aria-hidden
        />
        Evaluation
      </h4>
      <p className="mt-2 text-sm leading-[1.65] text-body max-w-[68ch]">
        {systemResponse}
      </p>
    </section>
  );
};

export default VivaSystemResponse;
