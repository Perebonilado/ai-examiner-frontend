import React, { FC } from "react";

interface Props {
  TableHeadComponent: React.ReactNode;
  bgColor?: string;
}

const EnhancedTableHead: FC<Props> = ({ TableHeadComponent, bgColor }) => {
  return (
    <div
      className={`px-3 py-5 rounded-t-xl bg-sunken border-b border-b-line`}
    >
      {TableHeadComponent}
    </div>
  );
};

export default EnhancedTableHead;
