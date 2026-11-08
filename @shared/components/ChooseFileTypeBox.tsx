import React, { FC } from "react";
import { FileUp, Images } from "lucide-react";

interface Props {
  handleSelectImages: () => void;
  handleSelectFiles: () => void;
}

const itemClass =
  "group flex items-center gap-2.5 w-full h-9 max-md:h-11 px-2.5 rounded-[7px] text-sm font-medium text-body text-left hover:bg-hover hover:text-ink focus-visible:bg-hover transition-colors";

const ChooseFileTypeBox: FC<Props> = ({
  handleSelectFiles,
  handleSelectImages,
}) => {
  return (
    <div
      role="menu"
      className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-20 min-w-[200px] p-1.5 rounded-xl bg-surface border border-edge shadow-pop text-left"
    >
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={handleSelectImages}
      >
        <Images
          size={16}
          strokeWidth={1.75}
          className="text-muted group-hover:text-ink"
          aria-hidden
        />
        Select images
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={handleSelectFiles}
      >
        <FileUp
          size={16}
          strokeWidth={1.75}
          className="text-muted group-hover:text-ink"
          aria-hidden
        />
        Select file
      </button>
    </div>
  );
};

export default ChooseFileTypeBox;
