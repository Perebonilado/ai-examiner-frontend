import CloseIcon from "@/icons/CloseIcon";
import DocumentIcon from "@/icons/DocumentIcon";
import SuccessIcon from "@/icons/SuccessIcon";
import { getFileNameWithoutExtension } from "@/utils";
import React, { FC } from "react";

interface Props {
  fileName: string;
  handleDelete: () => void;
}

const AttachedFileInfo: FC<Props> = ({ fileName, handleDelete }) => {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <SuccessIcon />
        <p className="font-semibold">Uploaded Successfully!</p>
      </div>
      <div className="flex items-center w-full max-w-[400px] rounded-xl bg-[#F7F4FF] p-4 relative">
        <div style={{ flex: 1 }} className="flex items-center justify-center">
          <DocumentIcon />
        </div>
        <div style={{ flex: 4 }} className="overflow-hidden">
          <p className="font-semibold truncate text-xs">
            {getFileNameWithoutExtension(fileName)}
          </p>
        </div>
        <button
          className="cursor-pointer"
          onClick={() => {
            handleDelete();
          }}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export default AttachedFileInfo;
