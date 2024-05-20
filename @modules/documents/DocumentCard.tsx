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
      className="w-full cursor-pointer p-4 max-w-[350px] h-[200px] rounded-xl bg-white drop-shadow-sm border border-gray-200"
    >
      <div className="h-[60%] flex gap-2">
        <FileIcon />
        <div>
          {averageScore !== null && (
            <>
              <p
                style={{ backgroundColor: color.background, color: color.fill }}
                className="text-xs font-semibold flex items-center gap-1 w-fit px-6 py-[1px] rounded-full"
              >
                {/* <span
                  style={{ backgroundColor: color.fill }}
                  className="w-[14px] h-[14px] block rounded-full"
                ></span> */}
                {averageScore}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Excellent Work</p>
            </>
          )}
          {averageScore === null && (
            <p className="text-xs font-semibold">Unanswered</p>
          )}
        </div>
      </div>
      <div className="h-[40%] flex flex-col justify-end gap-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-gray-500">
          Created{" "}
          {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
        </p>
      </div>
    </div>
    // <div
    //   onClick={() => {
    //     router.push(`/questions/view-questions/${id}`);
    //   }}
    //   className="w-[250px] h-[280px] gap-2 p-5 flex flex-col bg-white rounded-lg shadow-black-400 shadow-xl cursor-pointer"
    // >
    //   <div
    //     style={{ flex: 2, backgroundColor: color.background }}
    //     className={iconBg}
    //   >
    //     {/* <p
    //       className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-xs font-bold"
    //       style={{ color: color.fill }}
    //     >
    //       {averageScore === null ? 'Unanswered' : `Average score  ${averageScore.toFixed(2)}%`}
    //     </p> */}
    //     <span style={{ fill: color.fill }}>
    //       <FileIcon />
    //     </span>
    //   </div>
    //   <div style={{ flex: 1 }} className="overflow-hidden flex flex-col gap-1">
    //     <p className="font-medium truncate text-sm">
    //       {capitalizeFirstLetterOfEachWord(title.toLowerCase())}
    //     </p>
    //     <p className="text-xs text-gray-400 font-semibold">
    //       {questionSetCount} set(s) of questions
    //     </p>
    //     <p className="text-xs text-gray-400">
    //       Created -{" "}
    //       {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
    //     </p>
    //   </div>
    // </div>
  );
};

export default DocumentCard;
