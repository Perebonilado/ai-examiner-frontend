import React, { FC, useEffect, useState } from "react";
import TopicItem from "./TopicItem";
import { useParams } from "next/navigation";
import { useGetAllSavedDocumentTopicsV2Query } from "@/api-services/document-topic.service";
import Button from "@/@shared/ui/Button";

const TopicsContainer: FC = () => {
  const params = useParams();
  const [documentId, setDocumentId] = useState("");
  useEffect(() => {
    if (params) {
      setDocumentId(params.id as string);
    }
  }, [params]);

  const { data: topics } = useGetAllSavedDocumentTopicsV2Query(
    { documentId },
    { skip: !documentId }
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between border-b border-gray-100 px-4 py-3 bg-gray-50">
        <div className="flex flex-col w-full">
          <span className="text-sm font-medium text-gray-800 mb-1">
            Reading Progress
          </span>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${0}%` }}
            />
          </div>
        </div>
        {/* <div className="flex justify-end gap-3 ml-4">
          <Button title="Mark as read" size="small" variant="outlined" />
          <Button title="New test" size="small" />
        </div> */}
      </div>

      {/* Scrollable List */}
      {topics && (
        <div className="w-full  overflow-y-auto no-scrollbar h-full pb-20">
          {topics.map((topic, idx) => {
            return <TopicItem {...topic} key={idx} />;
          })}
        </div>
      )}
    </div>
  );
};

export default TopicsContainer;
