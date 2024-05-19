import CloseIcon from "@/icons/CloseIcon";
import CourseDocumentIcon from "@/icons/CourseDocumentIcon";
import React, { FC } from "react";

interface Props {
  fileName: string;
  handleDelete: () => void;
}

const AttachedFileInfo: FC<Props> = ({ fileName, handleDelete }) => {
  return (
    <div className="flex items-center w-full max-w-[300px] rounded-xl bg-white p-4 shadow-md relative">
      <span
        className="absolute top-[-6px] right-[-6px] cursor-pointer"
        onClick={() => {
          handleDelete();
        }}
      >
        <CloseIcon />
      </span>
      <div style={{ flex: 1 }} className="flex items-center justify-center">
        <CourseDocumentIcon fill="#2F004F" width={25} height={25} />
      </div>
      <div style={{ flex: 4 }} className="overflow-hidden">
        <p className="font-semibold truncate">{fileName}</p>
      </div>
    </div>
  );
};

export default AttachedFileInfo;
