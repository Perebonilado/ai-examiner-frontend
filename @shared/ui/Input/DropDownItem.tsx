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
      className="flex items-center h-9 px-2.5 rounded-lg text-sm text-body w-full hover:bg-hover hover:text-ink"
    >
      <p>{label}</p>
    </div>
  );
};

export default DropDownItem;