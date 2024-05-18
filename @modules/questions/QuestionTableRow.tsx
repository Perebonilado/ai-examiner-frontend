import Button from "@/@shared/ui/Button";
import { QuestionSummaryModel } from "@/models/questions.model";
import Link from "next/link";
import React, { FC } from "react";
import * as moment from "moment";

interface Props extends QuestionSummaryModel {}

const QuestionTableRow: FC<Props> = ({ count, createdAt, type, id }) => {
  return (
    <div className="flex items-center text-sm  text-gray-700 w-full gap-6 border-b border-b-gray-200 px-3 py-4">
      <div style={{ flex: 1 }}>
        <Link href={`/questions/practise-questions/${id}`}>
          <p className="text-[#007bff] underline">
            {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
          </p>
        </Link>
      </div>
      <div style={{ flex: 1 }}>{type}</div>
      <div style={{ flex: 1 }}>{count}</div>
      {/* <div style={{ flex: 1 }} className="flex flex-wrap items-center gap-3">
        <Button
          title="Delete"
          size="small"
          className="!bg-rose-600 !border-rose-600"
        />
      </div> */}
    </div>
  );
};

export default QuestionTableRow;
