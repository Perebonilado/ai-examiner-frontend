import UploadIcon from "@/icons/UploadIcon";
import React, { FC } from "react";
import Button from "../ui/Button";

interface Props {
  handleSelectFile: (file: File) => void;
  handleDeleteFile: () => void;
  attachedFile: File | null;
  allowedTypes: string[]
}

const UploadFileBox: FC = () => {
  return (
    <>
      <div className="w-full p-6 h-[400px] bg-gray-50 border border-opacity-45 border-gray-300 rounded-xl flex flex-col items-center justify-center gap-4">
        <UploadIcon width={80} height={80} />
        <Button title="Click to upload file" size="large" variant="outlined" />
      </div>
      <p className="text-xs font-bold italic">
        Maximum File Size: 10mb | Allowed File Types: pdf, docx, pptx
      </p>
    </>
  );
};

export default UploadFileBox;
