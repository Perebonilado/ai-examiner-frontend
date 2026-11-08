import React, { FC } from "react";
import { Check, X } from "lucide-react";
import FileTypeTile, { getFileTypeTileExt } from "./FileTypeTile";

interface Props {
  fileName: string;
  fileType?: string;
  handleDelete: () => void;
}

const AttachedFileInfo: FC<Props> = ({ fileName, fileType, handleDelete }) => {
  return (
    <div className="flex flex-col items-center text-center w-full">
      <span className="w-11 h-11 mb-3.5 rounded-full grid place-items-center bg-success-bg text-success shadow-[0_0_0_6px_rgba(19,121,74,0.06)]">
        <Check size={22} strokeWidth={2.5} aria-hidden />
      </span>
      <p className="text-lg font-bold text-ink tracking-[-0.015em]" role="status">
        Uploaded successfully!
      </p>
      <div className="mt-[18px] flex items-center gap-3 max-w-full py-[7px] pr-1.5 pl-2 rounded-xl border border-edge bg-surface shadow-soft text-left">
        <FileTypeTile ext={getFileTypeTileExt(fileName, fileType)} size="sm" />
        <span className="min-w-0 text-sm font-semibold text-ink truncate">
          {fileName}
        </span>
        <button
          type="button"
          aria-label="Remove file"
          title="Remove file"
          className="w-8 h-8 flex-shrink-0 grid place-items-center rounded-lg text-muted hover:bg-hover hover:text-ink transition-colors"
          onClick={() => {
            handleDelete();
          }}
        >
          <X size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default AttachedFileInfo;
