import React, { FC } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";

interface Props {
  handleRetry: () => void;
}

// Sits under the failed message, right-aligned: the error line and a quiet Retry.
const RetrySendingMessageButton: FC<Props> = ({ handleRetry }) => {
  return (
    <div
      role="alert"
      className="self-end -mt-2 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-[13px] text-danger"
    >
      <CircleAlert size={15} strokeWidth={1.75} aria-hidden />
      <span>Oops! we had an issue sending your message</span>
      <button
        type="button"
        onClick={handleRetry}
        className="inline-flex items-center gap-[5px] h-[30px] max-md:h-10 px-2 -mr-2 rounded-[7px] text-[13px] font-semibold text-ink hover:bg-hover transition-colors"
      >
        <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
        Retry
      </button>
    </div>
  );
};

export default RetrySendingMessageButton;
