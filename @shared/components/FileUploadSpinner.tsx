import UploadIconBox from "@/icons/UploadIconBox";
import React, { FC } from "react";

interface Props {
  title?: string;
  showIcon?: boolean;
}

const FileUploadSpinner: FC<Props> = ({
  title = "File upload in progress",
  showIcon = true,
}) => {
  return (
    <div className="flex flex-col items-center">
      <p className="text-center font-semibold text-sm">{title}</p>
      <div className="relative w-[90px] h-[90px]">
        <div className="absolute top-0 left-0 w-full h-full animate-spin">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M20,50 A30,30 0 0 1 80,50"
              fill="none"
              stroke="#9E69E3"
              strokeWidth="6"
              width={70}
              height={70}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {showIcon && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <UploadIconBox />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSpinner;
