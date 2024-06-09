import FileIcon from "@/icons/FileIcon";
import { AllDocumentsModel } from "@/models/document.model";
import React, { FC } from "react";
import * as moment from "moment";
import { useRouter } from "next/router";

interface Props extends AllDocumentsModel {}

const DocumentCard: FC<Props> = ({
  createdAt,
  id,
  title,
}) => {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push(`/questions/view-questions/${id}`);
      }}
      className="w-full cursor-pointer p-4 py-5 max-w-[350px] h-[180px] rounded-xl bg-white drop-shadow-sm border border-gray-200"
    >
      <div className="h-[60%] flex gap-2">
        <FileIcon />
      </div>
      <div className="h-[40%] flex flex-col justify-end gap-1 overflow-hidden px-2">
        <p className="text-sm font-bold truncate">{title}</p>
        <p className="text-xs text-gray-500">
          Created{" "}
          {moment.utc(createdAt).local().format("dddd, MMMM D, YYYY h:mma")}
        </p>
      </div>
    </div>
  );
};

export default DocumentCard;
