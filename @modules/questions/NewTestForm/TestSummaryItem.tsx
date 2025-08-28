import React, { FC } from "react";

interface Props {
  title: string;
  value: string;
}

const TestSummaryItem: FC<Props> = ({ title, value }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-center text-xs">{title}</p>
      <p className="text-[#9333EA] font-semibold text-center text-sm">{value}</p>
    </div>
  );
};

export default TestSummaryItem;
