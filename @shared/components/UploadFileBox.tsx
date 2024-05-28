import UploadIcon from "@/icons/UploadIcon";
import React, { ElementRef, FC, useRef } from "react";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import TransitionUp from "@/transitions/TransitionUp";
import AttachedFileInfo from "./AttachedFileInfo";
import { convertMegaBytesToBytes } from "@/utils";
import { AppLoader } from "./AppLoader";
import Spinner from "./Spinner";

interface Props {
  handleSelectFile: (file: File) => void;
  handleDeleteFile: () => void;
  attachedFile: File | null;
  allowedTypes: string[];
  uploadLoading: boolean;
  maxFileSizeMB?: number;
}

const UploadFileBox: FC<Props> = ({
  allowedTypes,
  attachedFile,
  handleDeleteFile,
  handleSelectFile,
  uploadLoading,
  maxFileSizeMB = 10,
}) => {
  const inputRef = useRef<ElementRef<"input">>(null);
  const validateFileSize = (file: File) => {
    const maxSizeInBytes = convertMegaBytesToBytes(maxFileSizeMB);
    if (file.size > maxSizeInBytes) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            const file = e.target.files[0];
            if (validateFileSize(file)) {
              handleSelectFile(e.target.files[0]);
              return;
            } else {
              toast.error(`File Size must be ${maxFileSizeMB}mb or less`);
            }
          }
        }}
        className="hidden"
        accept={allowedTypes.map((t) => `.${t}`).join(", ")}
      />
      <div className="w-full p-6 h-[300px] bg-gray-50 border border-opacity-45 border-gray-300 rounded-xl flex flex-col items-center justify-center gap-4">
        {!attachedFile && !uploadLoading && (
          <UploadIcon width={80} height={80} />
        )}
        {!attachedFile && !uploadLoading && (
          <div className="flex flex-col justify-center gap-3">
            <Button
              onClick={() => {
                inputRef.current?.click();
              }}
              title="Click to upload file"
              size="large"
              variant="outlined"
              type="button"
            />
            <p className="text-xs italic">
              Maximum File Size: {maxFileSizeMB}mb | Allowed File Types: pdf,
              docx, pptx
            </p>
          </div>
        )}

        {attachedFile && !uploadLoading && (
          <TransitionUp>
            <AttachedFileInfo
              handleDelete={() => {
                handleDeleteFile();
                if (inputRef.current && inputRef.current.value)
                  inputRef.current.value = "";
              }}
              fileName={attachedFile.name}
            />
          </TransitionUp>
        )}
        {attachedFile && uploadLoading && (
          <div className="flex flex-col items-center justify-center gap-3">
            <Spinner />
            <p className="text-center truncate text-xs font-semibold">
              File upload in progess...
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadFileBox;
