import React, { FC } from "react";

interface Props {
  progress: number;
}

/** Thin reading-progress track (percentage of topics read). */
const ReadingProgressBar: FC<Props> = ({ progress }) => {
  return (
    <div
      role="progressbar"
      aria-label="Topics read"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 w-full overflow-hidden rounded-full bg-sunken"
    >
      <span
        className="block h-full rounded-full bg-accent-bright transition-[width] duration-500 ease-out-expo"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;
