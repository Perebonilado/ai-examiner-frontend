import React, { FC } from "react";
import { Upload } from "lucide-react";

interface Props {
  title?: string;
  showIcon?: boolean;
}

/* Calm loading indicator: a violet arc on a neutral track, with the message below. */
const FileUploadSpinner: FC<Props> = ({
  title = "File upload in progress",
  showIcon = true,
}) => {
  return (
    <div className="flex flex-col items-center gap-3.5" role="status">
      <div className="relative w-14 h-14">
        <svg
          viewBox="0 0 56 56"
          className="absolute inset-0 w-full h-full animate-spin [animation-duration:1.1s]"
          aria-hidden="true"
        >
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="var(--sunken)"
            strokeWidth="4"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="40 151"
          />
        </svg>
        {showIcon && (
          <span className="absolute inset-0 grid place-items-center text-muted">
            <Upload size={18} strokeWidth={1.75} aria-hidden />
          </span>
        )}
      </div>
      <p className="text-center font-semibold text-sm text-ink">{title}</p>
    </div>
  );
};

export default FileUploadSpinner;
