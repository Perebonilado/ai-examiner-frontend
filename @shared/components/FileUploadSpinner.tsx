import React, { FC } from "react";
import { Upload } from "lucide-react";
import Spinner from "./Spinner";

interface Props {
  title?: string;
  showIcon?: boolean;
}

/* Calm loading indicator: the app spinner (with an optional icon inside) and the message below. */
const FileUploadSpinner: FC<Props> = ({
  title = "File upload in progress",
  showIcon = true,
}) => {
  return (
    <div className="flex flex-col items-center gap-3.5" role="status">
      <div className="relative w-14 h-14">
        <Spinner size="lg" className="absolute inset-0" />
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
