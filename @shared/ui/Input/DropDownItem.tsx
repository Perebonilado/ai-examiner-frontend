import React, { FC } from "react";

interface Props {
  id?: string;
  /** Highlighted by the keyboard. */
  active?: boolean;
  selected?: boolean;
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
  id,
  active = false,
  selected = false,
  value,
  label,
  defaultSelected,
  onSelect,
}) => {
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      // Keep focus on the field, so the keyboard keeps working after a click.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect({ value, label, defaultSelected })}
      className={`flex items-center h-9 px-2.5 rounded-lg text-sm w-full hover:bg-hover hover:text-ink ${
        active ? "bg-hover text-ink" : "text-body"
      } ${selected ? "font-semibold" : ""}`}
    >
      <p>{label}</p>
    </div>
  );
};

export default DropDownItem;