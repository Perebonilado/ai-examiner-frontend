import React, { FC } from "react";

interface Props {
  fill?: string;
  width?: number;
  height?: number;
}

const DotsIcon: FC<Props> = ({ fill = "#FFFFFF", width = 20, height = 20 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="Isolation_Mode"
      data-name="Isolation Mode"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill={fill}
    >
      <circle cx="21.517" cy="12.066" r="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="2.5" cy="12" r="2.5" />
    </svg>
  );
};

export default DotsIcon;
