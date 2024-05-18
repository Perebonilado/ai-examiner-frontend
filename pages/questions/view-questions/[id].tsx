import QuestionTableRow from "@/@modules/questions/QuestionTableRow";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import {
  useGenerateQuestionsMutation,
  useGetQuestionSummariesQuery,
} from "@/api-services/questions.service";
import { useGetAllUserTopicsQuery } from "@/api-services/topic.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ViewQuestions: NextPage = () => {
  const [page, setPage] = useState(1);
  const [topicId, setTopicId] = useState<string>("");
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetQuestionSummariesQuery(
    {
      page,
      pageSize: 10,
      courseDocumentId: topicId,
    },
    { skip: !topicId, refetchOnMountOrArgChange: true }
  );

  const { data: topic } = useGetAllUserTopicsQuery(
    { courseId: "", page: 1, pageSize: 10, title: "", id: topicId },
    { refetchOnMountOrArgChange: true, skip: !topicId }
  );

  const [
    generateQuestions,
    {
      isLoading: generateQuestionsLoading,
      error: generateQuestionsError,
      isSuccess: generateQuestionsSuccess,
    },
  ] = useGenerateQuestionsMutation();

  const { setModalContent } = useModalContext();

  const handleGenerateQuestions = () => {
    generateQuestions(topicId);
  };

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }

    if (generateQuestionsError && "status" in generateQuestionsError) {
      if ("data" in generateQuestionsError) {
        const { message } = generateQuestionsError.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error, generateQuestionsError]);

  useEffect(() => {
    if (isLoading || generateQuestionsLoading) {
      setModalContent(
        <AppLoader
          loaderMessage={
            generateQuestionsLoading
              ? "Hang in there while we generate your questions, it will only take a moment..."
              : undefined
          }
        />
      );
    } else {
      setModalContent(null);
    }
  }, [isLoading, generateQuestionsLoading]);

  useEffect(() => {
    if (generateQuestionsSuccess) {
      toast.success("Questions generated successfully");
    }
  }, [generateQuestionsSuccess]);

  useEffect(() => {
    if (params) {
      setTopicId(params.id as string);
    }
  }, [params]);

  return (
    <>
      <AppHead title="View Questions" />
      <AppLayout>
        <div className="flex items-center justify-between w-full pb-10">
          {topic && (
            <h2 className="text-2xl font-bold">
              {capitalizeFirstLetterOfEachWord(topic.topics[0].title.toLowerCase())} Questions
            </h2>
          )}
          <Button
            title="Generate New Questions"
            onClick={handleGenerateQuestions}
          />
        </div>
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get question summaries for this topic" />
            <Button title="Reload Question Summaries" onClick={refetch} />
          </div>
        )}
        <EnhancedTable
          maxWidth="100%"
          headCellData={[
            { title: "Created At", flex: 1 },
            { title: "Type", flex: 1 },
            { title: "Question Count", flex: 1 },
            // { title: "Actions", flex: 1 },
          ]}
          generic={true}
          rowData={data?.questions}
          rowComponent={(rows) => <QuestionTableRow {...rows} />}
        />
        {data && (
          <Pagination
            className=""
            currentPage={page}
            pageSize={data.meta.pageSize}
            totalCount={data.meta.totalCount}
            onPageChange={(p) => {
              setPage(() => p);
            }}
          />
        )}
      </AppLayout>
    </>
  );
};

export default ViewQuestions;

const mock = [
  {
    id: 1,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 5,
  },
  {
    id: 2,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 10,
  },
  {
    id: 3,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 20,
  },
  {
    id: 4,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 5,
  },
  {
    id: 5,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 5,
  },
];
