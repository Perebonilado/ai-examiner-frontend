import React, { ElementRef, FC, useRef } from "react";
import { TrashIcon } from "@/icons/TrashIcon";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import ScrollableIcon from "@/icons/ScrollableIcon";

interface Props {
  handleSelectFile: (file: File) => void;
  handleDeleteFile: () => void;
  isRequired?: boolean;
  label?: string;
  error?: string;
  attachedFile: File | null;
}

const FileAttachmentInput: FC<Props> = ({
  handleSelectFile,
  handleDeleteFile,
  isRequired,
  label,
  error,
  attachedFile,
}) => {
  const inputRef = useRef<ElementRef<"input">>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            handleSelectFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />
      <div className="flex flex-col w-full">
        {label && (
          <label className="text-white text-sm mb-2">
            {label} {isRequired && <span className="text-rose-600">*</span>}
          </label>
        )}
        {!attachedFile && (
          <div className="w-full relative">
            <input
              placeholder="Attach"
              className="min-h-[20px] flex m-0 placeholder:text-gray-400 placeholder:text-sm px-4 py-1  rounded-md outline-none bg-white border-none w-full cursor-pointer"
              readOnly
              onClick={() => {
                inputRef?.current?.click();
              }}
            />
            <ScrollableIcon className="absolute right-2 top-1/2 -translate-y-1/2"/>
          </div>
        )}
        {attachedFile && (
          <div className="flex items-center gap-4">
            <p className="text-white text-sm">{attachedFile.name}</p>
            <button onClick={handleDeleteFile}>
              <TrashIcon fill="red" />
            </button>
          </div>
        )}
        {Boolean(error?.trim()) && (
          <ErrorMessage className="mt-[4px] p-0" message={error as string} />
        )}
      </div>
    </>
  );
};

export default FileAttachmentInput;
