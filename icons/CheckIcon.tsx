import React, { FC } from "react";

interface Props {
  fill?: string;
}

const CheckIcon: FC<Props> = ({ fill = "#2C00B9" }) => {
  return (
    <svg
      width="50"
      height="15"
      viewBox="0 0 90 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 24.503L28.6129 51.1159C29.3499 51.8529 30.5294 51.9003 31.3232 51.2249L88 3"
        stroke={fill}
        stroke-width="5.31767"
      />
    </svg>
  );
};

export default CheckIcon;
