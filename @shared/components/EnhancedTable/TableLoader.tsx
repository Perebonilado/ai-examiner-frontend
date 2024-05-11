import React, { FC } from "react";
import Skeleton from "react-loading-skeleton";

interface Props {
  headCellData?: { title: string; flex: number }[];
}

const TableLoader: FC<Props> = ({ headCellData }) => {
  return (
    <>
      <div className="flex justify-between gap-4">
        {headCellData?.map((item, idx) => {
          return (
            <div style={{ flex: item.flex }} key={idx}>
              <Skeleton />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-4">
        {headCellData?.map((item, idx) => {
          return (
            <div style={{ flex: item.flex }} key={idx}>
              <Skeleton />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-4">
        {headCellData?.map((item, idx) => {
          return (
            <div style={{ flex: item.flex }} key={idx}>
              <Skeleton />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TableLoader;
