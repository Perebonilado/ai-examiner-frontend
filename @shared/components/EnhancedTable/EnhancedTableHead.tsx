import React, { FC } from "react";

interface Props {
  TableHeadComponent: React.ReactNode;
  bgColor?: string;
}

const EnhancedTableHead: FC<Props> = ({ TableHeadComponent, bgColor }) => {
  return (
    <div
      className={`px-3 py-5 rounded-t-xl bg-slate-200 border-b border-b-gray-200`}
    >
      {TableHeadComponent}
    </div>
  );
};

export default EnhancedTableHead;
