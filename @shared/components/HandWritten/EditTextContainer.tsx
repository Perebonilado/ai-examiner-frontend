import React, { FC, useState } from "react";
import PageControls from "./PageControls";
import EditIcon from "@/icons/EditIcon";

interface Props {
  text: string;
  index: number;
  totalCount: number;
  currentPage: number;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handleChange: (text: string, index: number) => void;
}

const EditTextContainer: FC<Props> = ({
  text,
  handleChange,
  index,
  ...pageControls
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col border border-[#9E69E3] mb-3 rounded-2xl p-3 gap-3">
        <p className="text-right text-[#9333EA] text-sm font-medium flex items-center justify-end gap-2">
          <EditIcon width={15} height={15} fill="#9333EA" />
          Edit text
        </p>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => {
              handleChange(e.target.value.trim(), index);
            }}
            className="w-full h-full resize-none no-scrollbar outline-none border-none"
          ></textarea>
        </div>
      </div>
      <PageControls {...pageControls} />
    </div>
  );
};

export default EditTextContainer;
