import React, { FC } from "react";

interface Props {
  fill?: string;
  width?: number;
  height?: number;
}

const UploadIconAlt: FC<Props> = ({
  width = 14,
  height = 15,
  fill = "#9D6EC2",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.94922 10H8.44922V5.5H11.4492L6.19922 0.25L0.949219 5.5H3.94922V10ZM0.949219 11.5H11.4492V13H0.949219V11.5Z"
        fill={fill}
      />
    </svg>
  );
};

export default UploadIconAlt;
