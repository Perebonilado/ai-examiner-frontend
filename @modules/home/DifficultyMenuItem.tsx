import React, { FC } from "react";
import cn from "classnames";

interface Props {
  label: string;
  value: string;
  selected: boolean;
  handleSelect: (label: string) => void;
  /** 1–3: how many of the three level bars are filled. */
  level?: number;
}

/* Difficulty tile: three rising bars over the label. Selected = violet border + tint. */
const DifficultyMenuItem: FC<Props> = ({
  handleSelect,
  selected,
  label,
  value,
  level = 1,
}) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        "flex flex-col items-center gap-2.5 pt-4 pb-3.5 px-2 rounded-xl border-[1.5px] text-sm font-semibold transition-colors",
        selected
          ? "border-accent bg-accent-50 text-accent-900"
          : "border-edge bg-surface text-ink hover:border-accent-300"
      )}
      onClick={() => {
        handleSelect(value);
      }}
    >
      <span className="flex items-end gap-[3px] h-[18px]" aria-hidden>
        {[7, 12, 18].map((h, i) => (
          <i
            key={h}
            className={cn("w-[5px] rounded-[2px]", {
              "bg-accent": i < level && selected,
              "bg-subtle": i < level && !selected,
              "bg-control": i >= level,
            })}
            style={{ height: h }}
          />
        ))}
      </span>
      {label}
    </button>
  );
};

export default DifficultyMenuItem;
