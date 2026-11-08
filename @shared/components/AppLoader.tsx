import React, { FC } from "react";
import Spinner from "./Spinner";

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
      <Spinner size={size} tone="onDark" />
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
