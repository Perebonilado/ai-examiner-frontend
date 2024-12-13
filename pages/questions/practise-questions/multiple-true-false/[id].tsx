import MultipleTrueFalseCardContainer from "@/@modules/questions/MultipleTrueFalseCardContainer";
import AppHead from "@/@shared/components/AppHead";
import Button from "@/@shared/ui/Button";
import IconButton from "@/@shared/ui/IconButton";
import { useGetQuestionsByIdQuery } from "@/api-services/questions.service";
import ChevronLeft from "@/icons/ChevronLeft";
import DotsIcon from "@/icons/DotsIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { ElementRef, useEffect, useRef, useState } from "react";
import * as moment from "moment";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { GetMultipleTrueFalseQuestionByIdModel } from "@/models/questions.model";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";
import { useSaveProgressMutation } from "@/api-services/question-progress.service";
import Dialog from "@/@shared/components/Dialog";
import ShareIcon from "@/icons/ShareIcon";
import ShareQuestionDialog from "@/@modules/questions/ShareQuestionDialog";
import SubmissionModal from "@/@modules/questions/SubmissionModal";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";
import { useGetAllSavedDocumentTopicsQuery } from "@/api-services/document-topic.service";

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

  const { data: topics, isLoading: topicsLoading } =
    useGetAllSavedDocumentTopicsQuery(
      { documentId },
      { skip: !documentId, refetchOnMountOrArgChange: true }
    );

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

  return (
    <AppLayout>
      <AppHead title="Multiple True False" />
      {data && (
        <div className="flex items-center justify-between mb-6">
          <Button
            title="Back"
            variant="text"
            starticon={<ChevronLeft />}
            className="!gap-1 mb-6 mt-7"
            onClick={() => {
              router.push(`/questions/view-questions/${data?.documentId}`);
            }}
          />

          <IconButton
            icon={<DotsIcon />}
            title="More"
            onClick={() => {
              setModalContent(
                <Dialog>
                  <div className="min-w-[165px]">
                    <Button
                      title="Share"
                      variant="contained"
                      endicon={<ShareIcon fill="#FFFFFF" />}
                      fullWidth
                      onClick={() => {
                        setModalContent(
                          <ShareQuestionDialog
                            handleCopy={handleCopyShareLink}
                          />
                        );
                      }}
                    />
                  </div>
                </Dialog>
              );
            }}
          />
        </div>
      )}
      {!data && error && (
        <div className="flex flex-col gap-4 justify-center items-center py-8">
          <ErrorMessage message="Something went wrong while trying to get questions" />
          <Button title="Reload Questions" onClick={refetch} />
        </div>
      )}
      <div ref={topOfContainerRef}></div>
      {data && (
        <div>
          <h1 className="text-center text-xl font-semibold">
            {capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())}{" "}
            Questions
          </h1>
          <p className="text-center text-sm text-gray-500 my-3">
            Date Created:{" "}
            {moment.utc(data.createdOn).local().format("MMMM D, YYYY h:mma")}
          </p>
          {isSubmitted && (
            <div className="mx-auto w-full max-w-[300px]">
              <Button
                title="Restart"
                variant="contained"
                size="large"
                fullWidth
                onClick={handleResetAnswers}
              />
            </div>
          )}
        </div>
      )}
      {data && (
        <MultipleTrueFalseCardContainer
          data={(data as GetMultipleTrueFalseQuestionByIdModel).data}
          submitted={isSubmitted}
          title={data.documentTitle}
          handleSubmitted={() => {
            setIsSubmitted(true);
          }}
          documentId={data.documentId}
          handleDone={() => {
            router.push(`/questions/view-questions/${data.documentId}`);
          }}
          allowMoreQuestionGeneration={true}
          handleGenerateMoreQuestions={() => {
            setModalContent(
              <GenerateQuestionsForm
                fileId={data.fileId}
                topics={topics?.topics ?? []}
                documentIdProp={data.documentId}
              />
            );
          }}
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
                  router.push(`/performance-tracking/question/${id}?type=multiple-true-false`);
                }}
              />
            );
          }}
        />
      )}
    </AppLayout>
  );
};

export default MultipleTrueFalse;
