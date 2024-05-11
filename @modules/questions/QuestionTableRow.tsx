import Button from "@/@shared/ui/Button";
import Link from "next/link";
import React, { FC } from "react";

interface Props {
  count: number;
  createdAt: Date;
  type: string;
  id: number;
}

const QuestionTableRow: FC<Props> = ({ count, createdAt, type, id }) => {
  return (
    <div className="flex items-center text-sm  text-gray-700 w-full gap-6 border-b border-b-gray-200 px-3 py-4">
      <div style={{ flex: 1 }}>
        <Link href={"/questions/practise-questions/4"}>
          <p className="text-[#007bff] underline">{id}</p>
        </Link>
      </div>
      <div style={{ flex: 1 }}>{type}</div>
      <div style={{ flex: 1 }}>{createdAt.toDateString()}</div>
      <div style={{ flex: 1 }}>{count}</div>
      <div style={{ flex: 1 }} className="flex flex-wrap items-center gap-3">
        <Button
          title="Delete"
          size="small"
          className="!bg-rose-600 !border-rose-600"
        />
      </div>
    </div>
  );
};

export default QuestionTableRow;
