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
    <div className="flex items-center text-sm  text-body w-full gap-6 border-b border-b-line px-3 py-4">
      <div style={{ flex: 1 }}>
        <Link href={`/questions/view-questions/${id}`}>
          <p className="text-accent underline">{title}</p>
        </Link>
      </div>
      <div style={{ flex: 1 }}>{questionSetCount}</div>
      <div style={{ flex: 1 }}>
        {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
      </div>
    </div>
  );
};

export default TopicsTableRow;
