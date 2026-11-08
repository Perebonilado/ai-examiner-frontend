import React, { FC } from "react";
import { motion } from "framer-motion";
import cn from "classnames";

interface Props {
  percentageLoading: number;
}

/* Compact floating progress card shown while the user reads the summary during generation. */
const TopLevelGenerateQuestionsLoader: FC<Props> = ({ percentageLoading }) => {
  const isReady = percentageLoading >= 100;
  const pct = Math.max(0, Math.min(100, Math.round(percentageLoading)));
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      role="status"
      className="fixed z-[5000] top-[72px] max-md:top-[68px] left-1/2 -translate-x-1/2 w-full max-w-[420px] max-md:max-w-[calc(100vw-32px)] px-4 py-3 rounded-xl bg-surface border border-edge shadow-lift"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink">
          {isReady ? "Your test is ready!" : "Preparing test"}
        </p>
        <p className="text-[13px] font-bold text-ink tabular-nums">{pct}%</p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isReady ? "Test generated" : "Generating test"}
        className="mt-2 h-1.5 rounded-full bg-sunken overflow-hidden"
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-500 ease-out",
            isReady ? "bg-success" : "bg-accent"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </motion.div>
  );
};

export default TopLevelGenerateQuestionsLoader;
