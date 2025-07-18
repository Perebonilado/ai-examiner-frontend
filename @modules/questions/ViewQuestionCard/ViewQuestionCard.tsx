import React, { FC, useEffect, useState } from "react";
import * as moment from "moment";
import Button from "@/@shared/ui/Button";
import ScorePill from "../ScorePill";
import { generateScoreColor, hyphenateString } from "@/utils";
import cn from "classnames";
import { QuestionSummaryModel } from "@/models/questions.model";
import Link from "next/link";
import ChevronDownAlt from "@/icons/ChevronDownAlt";
import TopicPillContainer from "../TopicPillContainer";
import { TrashIcon } from "@/icons/TrashIcon";
import { useModalContext } from "@/contexts/ModalContext";
import DeleteQuestionConfirmation from "../DeleteQuestionConfirmation";
import ShareIcon from "@/icons/ShareIcon";
import ShareQuestionDialog from "../ShareQuestionDialog";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import { useRouter } from "next/router";

interface Props extends QuestionSummaryModel {
  index: number;
}

const ViewQuestionCard: FC<Props> = ({
  count,
  createdAt,
  score,
  id,
  type,
  topics,
  progressPercentage,
  status,
  totalAnswered,
  index,
}) => {
  const scoreColor = generateScoreColor(score).scoreColor;
  const [isNew, setIsNew] = useState(false);

  const rootClassName = cn(
    `w-full cursor-pointer flex flex-col py-4 gap-4 max-w-[380px] min-h-[180px] bg-white rounded-xl drop-shadow-sm border border-gray-300 px-4`,
    {
      [`${styles["animate-border"]} animate-bounce`]: isNew,
    }
  );

  const [topicsExpanded, setTopicsExpanded] = useState(false);

  const chevronClasses = cn(`cursor-pointer transition-all duration-[.6s]`, {
    "rotate-180": topicsExpanded,
  });

  const { setModalContent } = useModalContext();

  useEffect(() => {
    const createdMoment = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const difference = now - createdMoment;
    const fifteenSeconds = 15000; // 15 seconds in milliseconds

    if (difference < fifteenSeconds && index === 0) {
      setIsNew(true);
      const timeout = setTimeout(() => {
        setIsNew(false);
      }, 10000);

      // Clean up the timeout
      return () => clearTimeout(timeout);
    } else {
      setIsNew(false);
    }
  }, [createdAt]);

  const getButtonText = () => {
    if (status === "submitted") {
      return "Review";
    }

    if (progressPercentage) {
      return "Continue";
    }

    return "Start Assessment";
  };

  const handleCopyShareLink = () => {
    try {
      navigator.clipboard.writeText(
        `${window.location.origin}/questions/shared/${hyphenateString(
          type.toLowerCase()
        )}/${id}`
      );

      toast.success("Copied to clipboard");
      setModalContent(null);
    } catch (error) {
      toast.error(`Oops! Let's try that again`);
      setModalContent(null);
    }
  };

  const router = useRouter();

  return (
    <div
      className={rootClassName}
      onClick={(e) => {
        router.push(
          `/questions/practise-questions/${hyphenateString(
            type.toLowerCase()
          )}/${id}`
        );
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <p className="font-bold">{type}</p>
          </div>

          <div>
            {!["flash cards", "oral (viva)", "essay"].includes(
              type.toLowerCase()
            ) && (
              <ScorePill
                score={score}
                uncompleted={
                  status === "in_progress" && progressPercentage !== null
                }
              />
            )}
          </div>
        </div>
        <p className="text-sm font-semibold">
          {type.toLowerCase() == "flash cards"
            ? `${count} Cards`
            : ["oral (viva)", "essay"].includes(type.toLowerCase())
            ? null
            : `${totalAnswered} Questions`}
        </p>
        <div className="flex items-center gap-3 mt-4 min-h-[30px]">
          <p className="text-xs text-[#8E8E8E]">
            {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
          </p>
          {topics.length ? (
            <div
              className={chevronClasses}
              onClick={(e) => {
                e.stopPropagation()
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
        <div className="flex items-center justify-between gap-2">
          <div>
            <Link
              href={`/questions/practise-questions/${hyphenateString(
                type.toLowerCase()
              )}/${id}`}
            >
              <Button
                title={getButtonText()}
                size="small"
                variant="text"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalContent(
                  <ShareQuestionDialog handleCopy={handleCopyShareLink} />
                );
              }}
            >
              <ShareIcon fill="#d1d5db" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalContent(<DeleteQuestionConfirmation questionId={id} />);
              }}
            >
              <TrashIcon fill="#d1d5db" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQuestionCard;
