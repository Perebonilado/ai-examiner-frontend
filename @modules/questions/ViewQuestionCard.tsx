import React, { FC } from "react";
import * as moment from "moment";
import Button from "@/@shared/ui/Button";
import ScorePill from "./ScorePill";
import { generateScoreColor } from "@/utils";
import cn from "classnames";
import { QuestionSummaryModel } from "@/models/questions.model";
import Link from "next/link";

interface Props extends QuestionSummaryModel {}

const ViewQuestionCard: FC<Props> = ({
  count,
  createdAt,
  documentId,
  score,
  id,
  type,
}) => {
  const scoreColor = generateScoreColor(score).scoreColor;

  const rootClassName = cn(
    `w-full flex flex-col max-w-[480px] h-[180px] rounded-xl shadow-lg p-4 bg-gray-50 border-l-[5px]`
  );

  return (
    <div className={rootClassName} style={{ borderLeftColor: scoreColor }}>
      <div
        style={{ flex: 1 }}
        className="flex flex-col justify-center gap-1 pb-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-bold">{type}</p>
          <ScorePill score={score} />
        </div>
        <p className="text-sm font-semibold">{count} Question(s)</p>
        <p className="text-xs text-gray-500">
          Created on:{" "}
          {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
        </p>
      </div>
      <div style={{ flex: 1 }} className="border-t flex items-center">
        <Link href={`/questions/practise-questions/${id}`}>
          <Button
            title={score !== null ? "Attempt Again" : "Start Assessment"}
            variant="outlined"
          />
        </Link>
      </div>
    </div>
  );
};

export default ViewQuestionCard;
