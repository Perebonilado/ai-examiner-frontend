import React, { FC } from "react";

interface Props {
  loaderMessage?: string;
  spinnerSize?: "sm" | "md";
}

/** Full-screen dark overlay with a quiet ring spinner and one line of status. */
export const AppLoader: FC<Props> = ({ loaderMessage, spinnerSize = "md" }) => {
  const size = spinnerSize === "sm" ? 28 : 36;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[8000] flex h-screen w-screen flex-col items-center justify-center gap-3.5 bg-[rgba(15,12,24,0.86)]"
    >
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
      >
        <circle cx="20" cy="20" r="16" strokeWidth="4" stroke="rgba(255,255,255,0.16)" />
        <circle
          cx="20"
          cy="20"
          r="16"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="30 100"
          stroke="var(--accent-300)"
        />
      </svg>
      {loaderMessage ? (
        <p className="w-full max-w-[500px] px-4 mx-auto text-center text-[15px] max-md:text-sm font-semibold text-white">
          {loaderMessage}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
};
