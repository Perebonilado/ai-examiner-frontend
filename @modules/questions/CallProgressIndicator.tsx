import React, { FC } from "react";
import VoiceOrb, { VoiceOrbState } from "./VoiceOrb";

interface Props {
  state: VoiceOrbState;
  level?: number;
}

const STATUS: Record<VoiceOrbState, string> = {
  speaking: "Examiner is speaking",
  listening: "Listening…",
  idle: "Ready when you are",
};

/* The voice orb with its one status line. */
const CallProgressIndicator: FC<Props> = ({ state, level }) => {
  return (
    <section
      aria-label="Call with the examiner"
      className="flex flex-col items-center justify-center gap-[67px] py-10 max-md:gap-[57px] max-md:py-6"
    >
      <VoiceOrb
        state={state}
        level={level}
        className="h-[216px] w-[216px] max-md:h-[184px] max-md:w-[184px]"
      />
      <p
        role="status"
        aria-live="polite"
        className="min-h-[22px] text-center text-[15px] font-medium text-subtle"
      >
        {STATUS[state]}
      </p>
    </section>
  );
};

export default CallProgressIndicator;
