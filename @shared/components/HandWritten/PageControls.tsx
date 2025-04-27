import ChevronLeft from "@/icons/ChevronLeft";
import React, { FC } from "react";

interface Props {
  totalCount: number;
  currentPage: number;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
}

const PageControls: FC<Props> = ({
  totalCount,
  currentPage,
  handleNextPage,
  handlePreviousPage,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <p className="text-sm text-[#9333EA] font-medium">Page</p>
      <div className="flex items-center gap-1">
        <button
          onClick={handlePreviousPage}
          className="w-[28px] h-[28px] bg-[#F4F4F4] flex items-center justify-center"
        >
          <ChevronLeft />
        </button>
        <p className="w-[47px] text-sm font-bold p-1 h-[28px] bg-[#F4F4F4] flex items-center justify-center">
          {currentPage}
        </p>
        <button
          onClick={handleNextPage}
          className="w-[28px] h-[28px] rotate-180 bg-[#F4F4F4] flex items-center justify-center"
        >
          <ChevronLeft />
        </button>
      </div>
      <p className="text-sm text-[#00000080]">of {totalCount}</p>
    </div>
  );
};

export default PageControls;
