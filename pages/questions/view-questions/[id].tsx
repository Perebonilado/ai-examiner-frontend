import ViewQuestionCardContainer from "@/@modules/questions/ViewQuestionCardContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetQuestionSummariesQuery } from "@/api-services/questions.service";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";
import ChevronLeft from "@/icons/ChevronLeft";
import { useRouter } from "next/router";

const ViewQuestions: NextPage = () => {
  const [page, setPage] = useState(1);
  const [documentId, setdocumentId] = useState<string>("");
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetQuestionSummariesQuery(
    {
      page,
      pageSize: 6,
      courseDocumentId: documentId,
    },
    { skip: !documentId, refetchOnMountOrArgChange: true }
  );

  const { data: document } = useGetAllUserDocumentsQuery(
    { courseId: "", page: 1, pageSize: 10, title: "", id: documentId },
    { refetchOnMountOrArgChange: true, skip: !documentId }
  );

  const { setModalContent } = useModalContext();

  const handleGenerateQuestions = () => {
    setModalContent(<GenerateQuestionsForm />);
  };

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (params) {
      setdocumentId(params.id as string);
    }
  }, [params]);

  const router = useRouter()

  return (
    <>
      <AppHead title="View Questions" />
      <AppLayout>
        <Button
          title="Back"
          variant="text"
          starticon={<ChevronLeft />}
          className="!gap-1 mb-6"
          onClick={()=>{
            router.push(`/documents`)
          }}
        />
        <div className="flex items-center justify-between w-full pb-10 max-md:flex-col max-md:gap-12">
          {document && (
            <h2 className="text-2xl font-bold max-md:text-center">
              {capitalizeFirstLetterOfEachWord(
                document.documents[0].title.toLowerCase()
              )}{" "}
              Questions
            </h2>
          )}
          <Button
            title="Generate New Questions"
            onClick={handleGenerateQuestions}
          />
        </div>
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get question summaries for this document" />
            <Button title="Reload Question Summaries" onClick={refetch} />
          </div>
        )}
        {data && <ViewQuestionCardContainer data={data?.questions} />}

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
