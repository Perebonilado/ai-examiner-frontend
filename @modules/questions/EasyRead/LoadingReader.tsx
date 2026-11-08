import React, { FC } from "react";

/** Quiet loading card while a document's files are fetched (Easy Read, Sprint read, document page). */
const LoadingReader: FC = () => {
  return (
    <div
      role="status"
      className="flex w-full max-w-[360px] flex-col items-center justify-center gap-3.5 rounded-2xl border border-line bg-surface px-6 py-9 shadow-soft max-sm:max-w-[calc(100vw-32px)]"
    >
      <svg viewBox="0 0 40 40" className="h-9 w-9 animate-spin" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="3.5" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="28 100"
        />
      </svg>
      <p className="text-center text-[13.5px] font-semibold text-ink">
        One moment... getting your files
      </p>
    </div>
  );
};

export default LoadingReader;
