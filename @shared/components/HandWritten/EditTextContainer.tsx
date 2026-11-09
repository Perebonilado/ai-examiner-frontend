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
      <div className="flex-1 flex flex-col border border-accent-300 mb-3 rounded-2xl p-3 gap-3">
        <p className="text-right text-accent text-sm font-medium flex items-center justify-end gap-2">
          <EditIcon width={15} height={15} fill="currentColor" />
          Edit text
        </p>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => {
              handleChange(e.target.value.trim(), index);
            }}
            className="w-full h-full resize-none no-scrollbar outline-none border-none text-sm leading-6"
          ></textarea>
        </div>
      </div>
      <PageControls {...pageControls} />
    </div>
  );
};

export default EditTextContainer;
