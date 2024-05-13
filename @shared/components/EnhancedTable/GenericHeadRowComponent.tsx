import React, { FC } from "react";

interface Props {
  headCellData: { title: string; flex: number }[];
}

const GenericHeadRowComponent: FC<Props> = ({ headCellData }) => {
  return (
    <div className="flex w-full gap-6">
      {headCellData.map(({ title, flex }, idx) => {
        return (
          <p className={`font-bold text-sm text-gray-600`} style={{ flex: flex }} key={idx}>
            {title.toUpperCase()}
          </p>
        );
      })}
    </div>
  );
};

export default GenericHeadRowComponent;
