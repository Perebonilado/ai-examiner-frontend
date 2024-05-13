import React, { FC } from "react";
import EnhancedTableHead from "./EnhancedTableHead";
import EnhancedTableBody from "./EnhancedTableBody";
import GenericHeadRowComponent from "./GenericHeadRowComponent";

interface Props {
  TableHeadComponent?: React.ReactNode;
  maxWidth?: string;
  rowData?: any[];
  rowComponent?: (row: any, idx: number) => React.ReactNode;
  headBg?: string;
  generic?: boolean;
  headCellData?: { title: string; flex: number }[];
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
}

const EnhancedTable: FC<Props> = ({
  TableHeadComponent,
  maxWidth = "768px",
  rowData,
  rowComponent,
  headBg,
  generic = false,
  headCellData,
  isError,
  isLoading,
  refetch,
}) => {
  return (
    <div
      className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full 
    scrollbar-thumb-gray-900 scrollbar-track-gray-300 shadow-md rounded-b-xl"
      style={{ maxWidth: maxWidth }}
    >
      <div className=" bg-transparent  min-w-[1000px]">
        <EnhancedTableHead
          TableHeadComponent={
            generic && headCellData ? (
              <GenericHeadRowComponent headCellData={headCellData} />
            ) : (
              TableHeadComponent
            )
          }
          bgColor={headBg}
        />
        <EnhancedTableBody
          rowData={rowData}
          rowComponent={(row, index) =>
            rowComponent ? rowComponent(row, index) : null
          }
          isError={isError}
          isLoading={isLoading}
          refetch={refetch}
          headCellData={headCellData}
        />
      </div>
    </div>
  );
};

export default EnhancedTable;

