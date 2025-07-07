import React, { FC } from "react";

interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

const CloseIcon: FC<Props> = ({ width = 13, height = 13, fill = "#000000" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 13 13"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.6836 1.50328L11.4498 0.269531L6.55859 5.16078L1.66734 0.269531L0.433594 1.50328L5.32484 6.39453L0.433594 11.2858L1.66734 12.5195L6.55859 7.62828L11.4498 12.5195L12.6836 11.2858L7.79234 6.39453L12.6836 1.50328Z"
        fill={fill}
      />
    </svg>
  );
};

export default CloseIcon;
