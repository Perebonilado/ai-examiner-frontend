import React, { FC } from "react";
import Spinner from "@/@shared/components/Spinner";

/** Quiet loading card while a document's files are fetched (Easy Read, Sprint read, document page). */
const LoadingReader: FC = () => {
  return (
    <div
      role="status"
      className="flex w-full max-w-[360px] flex-col items-center justify-center gap-3.5 rounded-2xl border border-line bg-surface px-6 py-9 shadow-soft max-sm:max-w-[calc(100vw-32px)]"
    >
      <Spinner size="md" />
      <p className="text-center text-[13.5px] font-semibold text-ink">
        One moment... getting your files
      </p>
    </div>
  );
};

export default LoadingReader;
