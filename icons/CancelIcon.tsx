import React, { FC } from "react";

interface Props {
  fill?: string;
}

const CancelIcon: FC<Props> = ({ fill = "#E31C1C" }) => {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.0529 10L19.1388 18.0977L18.0841 19.1523L9.98645 11.0664L1.88879 19.1523L0.834106 18.0977L8.92004 10L0.834106 1.90234L1.88879 0.847656L9.98645 8.93359L18.0841 0.847656L19.1388 1.90234L11.0529 10Z"
        fill={fill}
      />
    </svg>
  );
};

export default CancelIcon;
