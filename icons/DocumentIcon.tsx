import React, { FC } from "react";

interface Props {
  width?: number;
  height?: number;
}

const DocumentIcon: FC<Props> = ({ height=16, width=22 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 21.5H0V0.5H11L16 5.5V21.5Z" fill="#EE76F7" />
      <path d="M15.25 6H10.5V1.25L15.25 6Z" fill="#FEFFFF" />
      <path
        d="M4 9.5H12.5V10.5H4V9.5ZM4 11.5H10.5V12.5H4V11.5ZM4 13.5H12.5V14.5H4V13.5ZM4 15.5H10.5V16.5H4V15.5Z"
        fill="#90089A"
      />
    </svg>
  );
};

export default DocumentIcon;
