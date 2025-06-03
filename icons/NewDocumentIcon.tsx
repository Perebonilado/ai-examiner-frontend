import React, { FC } from "react";

interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

const NewDocumentIcon: FC<Props> = ({
  fill = "#FFFFFF",
  height = 15,
  width = 15,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 15 14"
      fill={'none'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.65"
        y="0.65"
        width="13.7"
        height="12.7"
        rx="1.56226"
        stroke={fill}
        stroke-width="1.3"
      />
      <line
        x1="7.55697"
        y1="3.68164"
        x2="7.55697"
        y2="10.3184"
        stroke={fill}
        stroke-width="1.10613"
      />
      <line
        x1="3.90234"
        y1="6.8339"
        x2="11.0998"
        y2="6.8339"
        stroke={fill}
        stroke-width="1.10613"
      />
    </svg>
  );
};

export default NewDocumentIcon;
