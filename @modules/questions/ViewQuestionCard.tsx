import React, { FC, useState } from "react";
import * as moment from "moment";
import Button from "@/@shared/ui/Button";
import ScorePill from "./ScorePill";
import { generateScoreColor, hyphenateString } from "@/utils";
import cn from "classnames";
import { QuestionSummaryModel } from "@/models/questions.model";
import Link from "next/link";
import ArrowRight from "@/icons/ArrowRight";
import ChevronDownAlt from "@/icons/ChevronDownAlt";
import TopicPill from "./TopicPill";
import TopicPillContainer from "./TopicPillContainer";

interface Props extends QuestionSummaryModel {}

const ViewQuestionCard: FC<Props> = ({
  count,
  createdAt,
  score,
  id,
  type,
  topics,
}) => {
  const scoreColor = generateScoreColor(score).scoreColor;

  const rootClassName = cn(
    `w-full flex flex-col py-4 gap-4 max-w-[450px] min-h-[180px] bg-white rounded-xl drop-shadow-sm border border-gray-300 px-4`
  );

  const [topicsExpanded, setTopicsExpanded] = useState(false);

  const chevronClasses = cn(`cursor-pointer transition-all duration-[.6s]`, {
    "rotate-180": topicsExpanded,
  });

  return (
    <div className={rootClassName}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <p className="font-bold">{type}</p>
          <ScorePill score={score} />
        </div>
        <p className="text-sm font-semibold">{count} Question(s)</p>
        <div className="flex items-center gap-3 mt-4 min-h-[30px]">
          <p className="text-xs text-[#8E8E8E]">
            Created on:{" "}
            {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
          </p>
          {topics.length ? (
            <div
              className={chevronClasses}
              onClick={() => {
                setTopicsExpanded(!topicsExpanded);
              }}
            >
              <ChevronDownAlt />
            </div>
          ) : null}
        </div>
      </div>
      <div className="border-t pt-4 h-full border-t-gray-300 flex flex-col justify-center">
        <div>
          <TopicPillContainer data={topics} isOpen={topicsExpanded} />
        </div>
        <Link
          href={`/questions/practise-questions/${
            hyphenateString(type.toLowerCase())
          }/${id}`}
        >
          <Button
            title={score !== null ? "Retry" : "Start Assessment"}
            variant="text"
            endicon={<ArrowRight />}
          />
        </Link>
      </div>
    </div>
  );
};

export default ViewQuestionCard;
