import Button from "@/@shared/ui/Button";
import { AllDocumentsModel } from "@/models/document.model";
import Link from "next/link";
import React, { FC } from "react";
import * as moment from "moment";

interface Props extends AllDocumentsModel {}

const TopicsTableRow: FC<Props> = ({
  createdAt,
  title,
  id,
  questionSetCount,
}) => {
  return (
    <div className="flex items-center text-sm  text-gray-700 w-full gap-6 border-b border-b-gray-200 px-3 py-4">
      <div style={{ flex: 1 }}>
        <Link href={`/questions/view-questions/${id}`}>
          <p className="text-[#007bff] underline">{title}</p>
        </Link>
      </div>
      <div style={{ flex: 1 }}>{questionSetCount}</div>
      <div style={{ flex: 1 }}>
        {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
      </div>
      {/* <div style={{ flex: 1 }} className="flex flex-wrap items-center gap-3">
        <Button title="Edit" size="small" />
        <Button
          title="Delete"
          size="small"
          className="!bg-rose-600 !border-rose-600"
        />
      </div> */}
    </div>
  );
};

export default TopicsTableRow;
