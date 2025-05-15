import React, { FC } from "react";

interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

const ChevronLeft: FC<Props> = ({
  fill = "#000000",
  height = 25,
  width = 25,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill={fill}
    >
      <path d="m13.646,18.342l-5.281-5.281c-.283-.283-.439-.66-.439-1.061s.156-.777.439-1.061l5.281-5.281.707.707-5.281,5.281c-.094.095-.146.22-.146.354s.052.259.146.354l5.281,5.281-.707.707Z" />
    </svg>
  );
};

export default ChevronLeft;
