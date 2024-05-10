import React, { FC } from "react";

interface Props {
  value: string;
  label: string;
  defaultSelected?: boolean;
  onSelect: ({
    label,
    value,
  }: {
    label: string;
    value: string;
    defaultSelected?: boolean;
  }) => void;
}

const DropDownItem: FC<Props> = ({
  value,
  label,
  defaultSelected,
  onSelect,
}) => {
  return (
    <div
      role="option"
      onClick={() => onSelect({ value, label, defaultSelected })}
      className="py-3 border-b text-sm border-b-gray-300 text-black w-full bg-white last:border-none"
    >
      <p>{label}</p>
    </div>
  );
};

export default DropDownItem;