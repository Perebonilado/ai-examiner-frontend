import CloseIcon from "@/icons/CloseIcon";
import React, { FC } from "react";

interface Props {
  label: string;
  value: string;
  handleRemove?: ({ value, label }: { value: string; label: string }) => void;
}

const ChipItem: FC<Props> = ({ label, value, handleRemove }) => {
  return (
    <div className="px-3 chip py-1 rounded-full bg-gray-200 w-fit flex items-center gap-2">
      <p className="text-xs">{label}</p>

      <span
        className="w-fit cursor-pointer"
        onClick={() => {
          if (handleRemove) handleRemove({ label, value });
        }}
      >
        <CloseIcon height={15} width={15} />
      </span>
    </div>
  );
};

export default ChipItem;
