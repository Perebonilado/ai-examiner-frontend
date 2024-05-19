import FileIcon from "@/icons/FileIcon";
import { AllDocumentsModel } from "@/models/document.model";
import React, { FC } from "react";
import * as moment from "moment";
import { useRouter } from "next/router";
import {
  capitalizeFirstLetterOfEachWord,
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
}) => {
  const router = useRouter();
  const randomColors = [
    { fill: "fill-green-600", bg: "bg-green-200" },
    { fill: "fill-yellow-600", bg: "bg-yellow-200" },
    { fill: "fill-rose-600", bg: "bg-rose-200" },
    { fill: "fill-gray-600", bg: "bg-gray-200" },
  ];

  const color = randomColors[getRandomNumberInRange(0, 3)];

  const iconBg = cn(
    `bg-green-100 rounded-lg flex justify-center items-center`,
    {
      [color.bg]: true,
    }
  );

  const iconFill = cn(``, {
    [color.fill]: true,
  });

  return (
    <div
      onClick={() => {
        router.push(`/questions/view-questions/${id}`);
      }}
      className="w-[250px] h-[280px] gap-2 p-5 flex flex-col bg-white rounded-lg shadow-black-400 shadow-xl cursor-pointer"
    >
      <div style={{ flex: 2 }} className={iconBg}>
        <span className={iconFill}>
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
