import React, { FC } from "react";

interface Props {
  progress: number;
}

const ReadingProgressBar: FC<Props> = ({ progress }) => {
  return (
    <div className="flex flex-col w-full">
      <span className="text-sm font-medium text-gray-800 mb-1">
        Reading Progress
      </span>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ReadingProgressBar;
