import MultipleTrueFalseCardContainer from "@/@modules/questions/MultipleTrueFalseCardContainer";
import AppHead from "@/@shared/components/AppHead";
import Button from "@/@shared/ui/Button";
import { useGetQuestionsByIdQuery } from "@/api-services/questions.service";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { ElementRef, useEffect, useRef, useState } from "react";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { GetMultipleTrueFalseQuestionByIdModel } from "@/models/questions.model";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";
import { useSaveProgressMutation } from "@/api-services/question-progress.service";
import SubmissionModal from "@/@modules/questions/SubmissionModal";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";
import { useGetAllSavedDocumentTopicsQuery, useGetAllSavedDocumentTopicsV2Query } from "@/api-services/document-topic.service";
import { useDispatch } from "react-redux";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
} from "@/features/documentChatSlice";
import TestPageTitle from "@/@modules/questions/TestPageTitle";
import { openNewTestForm } from "@/features/newTestSlice";
import { capitalizeFirstLetterOfEachWord } from "@/utils";

const MultipleTrueFalse: NextPage = () => {
  const [id, setId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [documentId, setdocumentId] = useState<string>("");
  const params = useParams();
  const router = useRouter();
  const { setModalContent } = useModalContext();

  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data) {
      setdocumentId(data.documentId);
    }
  }, [data]);

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

  const [
    clearProgress,
    {
      isSuccess: progressCleared,
      error: errorClearingProgress,
      isLoading: progressClearing,
    },
  ] = useSaveProgressMutation();

  useEffect(() => {
    if (errorClearingProgress && "status" in errorClearingProgress) {
      if ("data" in errorClearingProgress) {
        const { message } = errorClearingProgress.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [errorClearingProgress]);

  useEffect(() => {
    if (progressClearing) {
      setModalContent(<AppLoader loaderMessage="Clearing Progress" />);
    } else {
      setModalContent(null);
    }
  }, [progressClearing]);

  useEffect(() => {
    if (progressCleared) {
      toast.success("Question reset successfully");
      window.location.reload();
    }
  }, [progressCleared]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader loaderMessage="Loading test" />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  const handleResetAnswers = () => {
    clearProgress({
      clearExistingProgress: true,
      id: id,
      status: "in_progress",
    });
  };

  const handleCopyShareLink = () => {
    try {
      navigator.clipboard.writeText(
        `${window.location.origin}/questions/shared/multiple-true-false/${id}`
      );

      toast.success("Copied to clipboard");
      setModalContent(null);
    } catch (error) {
      toast.error(`Oops! Let's try that again`);
      setModalContent(null);
    }
  };

  const topOfContainerRef = useRef<ElementRef<"div">>(null);

  const { data: topicsWithPages } = useGetAllSavedDocumentTopicsV2Query(
    { documentId },
    { skip: !documentId }
  );

  const handleNewTest = () => {
    dispatch(
      openNewTestForm({
        documentId: documentId,
        topics: topicsWithPages || [],
      })
    );
  };

  const backToDocument = () => {
    router.push(`/questions/view-questions/${data?.documentId}`);
  };

  return (
    <AppLayout
      handleBack={backToDocument}
      mobileTitle="Multiple true-false"
      crumbs={[
        { label: "All documents", href: "/documents" },
        ...(data
          ? [
              {
                label: capitalizeFirstLetterOfEachWord(
                  data.documentTitle.toLowerCase()
                ),
                href: `/questions/view-questions/${data.documentId}`,
              },
            ]
          : []),
        { label: "Multiple true-false" },
      ]}
    >
      <AppHead title="Multiple True False" />

      <div className="mx-auto w-full max-w-[740px]">
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get questions" />
            <Button title="Reload questions" onClick={refetch} />
          </div>
        )}
        <div ref={topOfContainerRef}></div>
        {data && (
          <TestPageTitle
            handleBack={backToDocument}
            title={data.documentTitle.toLowerCase()}
            meta={[
              "Multiple true-false",
              `${data.data.length} questions`,
              isSubmitted && "Submitted",
            ]}
          />
        )}
        {data && (
          <MultipleTrueFalseCardContainer
            data={(data as GetMultipleTrueFalseQuestionByIdModel).data}
            submitted={isSubmitted}
            title={data.documentTitle}
            handleSubmitted={() => {
              setIsSubmitted(true);
            }}
            handleRestart={handleResetAnswers}
            documentId={data.documentId}
            handleDone={() => {
              router.push(`/questions/view-questions/${data.documentId}`);
            }}
            allowMoreQuestionGeneration={true}
            handleGenerateMoreQuestions={handleNewTest}
            handleShowSubmissionModal={({ score, title }) => {
              setModalContent(
                <SubmissionModal
                  title={title}
                  scorePercentage={score}
                  handleScrollToTop={() => {
                    if (topOfContainerRef.current) {
                      topOfContainerRef.current.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                  allowPerformanceOverview={data.data.every((q) => {
                    return q["topic"] !== undefined;
                  })}
                  handlePerformanceOverview={() => {
                    router.push(
                      `/performance-tracking/question/${id}?type=multiple-true-false`
                    );
                  }}
                />
              );
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default MultipleTrueFalse;
