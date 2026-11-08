import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import {
  useGetEssayQuestionQuery,
  useGetQuestionsByIdQuery,
  useSubmitEssayQuestionMutation,
} from "@/api-services/questions.service";
import { useModalContext } from "@/contexts/ModalContext";
import ChevronLeft from "@/icons/ChevronLeft";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as moment from "moment";
import EssayItemContainer from "@/@modules/questions/Essay/EssayItemContainer";
import { GetQuestionByIdModel } from "@/models/questions.model";
import EssayAnalysisItemAccordion from "@/@modules/questions/Essay/EssayAnalysisItemAccordion";
import {
  useGetAllSavedDocumentTopicsQuery,
  useGetAllSavedDocumentTopicsV2Query,
} from "@/api-services/document-topic.service";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";
import EssayAnalysisContainer from "@/@modules/questions/Essay/EssayAnalysisContainer";
import { useDispatch } from "react-redux";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
  setMessages,
} from "@/features/documentChatSlice";
import { openNewTestForm } from "@/features/newTestSlice";

const Essay: NextPage = () => {
  const [id, setId] = useState("");
  const params = useParams();
  const [documentId, setdocumentId] = useState<string>("");
  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const { data: topicsWithPages } = useGetAllSavedDocumentTopicsV2Query(
    { documentId },
    { skip: !documentId }
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (documentId) {
      dispatch(setDocumentIdInView(documentId));
    }
  }, [documentId]);

  useEffect(() => {
    if (data?.documentTitle) {
      dispatch(setDocumentTitleInView(data.documentTitle));
    }
  }, [data]);

  const { setModalContent } = useModalContext();
  const router = useRouter();

  useEffect(() => {
    if (data) {
      setdocumentId(data.documentId);
    }
  }, [data]);

  useEffect(() => {
    if (params) {
      setId(params.id as string);
    }
  }, [params]);

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
      setModalContent(<AppLoader loaderMessage="Loading test" />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  const [submitTest, { isSuccess }] = useSubmitEssayQuestionMutation();
  const { data: analysisData, refetch: refetchAnalysis } =
    useGetEssayQuestionQuery({ questionId: id }, { skip: !id });

  useEffect(() => {
    if (isSuccess) {
      refetchAnalysis();
    }
  }, [isSuccess]);

  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (analysisData && analysisData.data?.length) {
      setShowAnalysis(true);
    }
  }, [analysisData]);

  const handleNewTest = () => {
    dispatch(
      openNewTestForm({
        documentId: documentId,
        topics: topicsWithPages || [],
      })
    );
  };

  const documentTitle = data?.documentTitle
    ? capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())
    : "";
  const questionCount = data ? (data as GetQuestionByIdModel).data.length : 0;

  return (
    <>
      <AppHead title="Essay" />

      <AppLayout
        handleBack={() => {
          router.push(`/questions/view-questions/${data?.documentId}`);
        }}
        crumbs={[
          { label: "All documents", href: "/documents" },
          ...(data
            ? [
                {
                  label: documentTitle,
                  href: `/questions/view-questions/${data.documentId}`,
                },
              ]
            : []),
          { label: "Essay" },
        ]}
        mobileTitle="Essay"
      >
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get questions" />
            <Button title="Reload Questions" onClick={refetch} />
          </div>
        )}

        {data && (
          <div className="mx-auto w-full max-w-[740px]">
            <header className="mb-5">
              <h1 className="text-2xl leading-[1.25] font-bold tracking-[-0.015em] text-ink [text-wrap:balance] max-md:text-xl">
                {documentTitle}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-subtle">
                <span>Essay</span>
                <span aria-hidden className="w-[3px] h-[3px] rounded-full bg-control" />
                <span>
                  {questionCount} {questionCount === 1 ? "question" : "questions"}
                </span>
              </p>
            </header>

            {!showAnalysis && (
              <EssayItemContainer
                data={(data as GetQuestionByIdModel).data}
                documentId={documentId}
                questionId={id}
                submitTest={submitTest}
                handleGenerateMoreQuestions={handleNewTest}
              />
            )}

            {analysisData && analysisData.data && showAnalysis && (
              <EssayAnalysisContainer
                data={analysisData.data}
                handleGenerateMoreQuestions={handleNewTest}
                handleDone={() => {
                  router.push(`/questions/view-questions/${data?.documentId}`);
                }}
              />
            )}
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default Essay;
