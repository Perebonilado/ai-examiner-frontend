import FileIcon from "@/icons/FileIcon";
import { AllDocumentsModel } from "@/models/document.model";
import React, { FC } from "react";
import * as moment from "moment";
import { useRouter } from "next/router";
import {
  capitalizeFirstLetterOfEachWord,
  generateDocumentCardColorFromScore,
  getRandomNumberInRange,
} from "@/utils";
import cn from "classnames";

interface Props extends AllDocumentsModel {}

const DocumentCard: FC<Props> = ({
  createdAt,
  id,
  questionIds,
  questionSetCount,
  title,
  averageScore,
}) => {
  const router = useRouter();

  const color = generateDocumentCardColorFromScore(averageScore);

  const iconBg = cn(`rounded-lg flex justify-center items-center relative`);

  return (
    <div
      onClick={() => {
        router.push(`/questions/view-questions/${id}`);
      }}
      className="w-[250px] h-[280px] gap-2 p-5 flex flex-col bg-white rounded-lg shadow-black-400 shadow-xl cursor-pointer"
    >
      <div
        style={{ flex: 2, backgroundColor: color.background }}
        className={iconBg}
      >
        <p
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-xs font-bold"
          style={{ color: color.fill }}
        >
          {averageScore === null ? 'Unanswered' : `Average score  ${averageScore}%`}
        </p>
        <span style={{ fill: color.fill }}>
          <FileIcon />
        </span>
      </div>
      <div style={{ flex: 1 }} className="overflow-hidden flex flex-col gap-1">
        <p className="font-medium truncate text-sm">
          {capitalizeFirstLetterOfEachWord(title.toLowerCase())}
        </p>
        <p className="text-xs text-gray-400 font-semibold">
          {questionSetCount} set(s) of questions
        </p>
        <p className="text-xs text-gray-400">
          Created -{" "}
          {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
        </p>
      </div>
    </div>
  );
};

export default DocumentCard;
