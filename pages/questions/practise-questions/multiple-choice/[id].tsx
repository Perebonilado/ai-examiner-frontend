import MCQContainer from "@/@modules/questions/MCQContainer";
import AppHead from "@/@shared/components/AppHead";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetQuestionsByIdQuery } from "@/api-services/questions.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as moment from "moment";
import ChevronLeft from "@/icons/ChevronLeft";
import MCQItemContainerPDF from "@/@modules/questions/MCQItemContainerPDF";
import IconButton from "@/@shared/ui/IconButton";
import DotsIcon from "@/icons/DotsIcon";
import Dialog from "@/@shared/components/Dialog";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useSaveProgressMutation } from "@/api-services/question-progress.service";
import { progress } from "framer-motion";

const Practice: NextPage = () => {
  const [id, setId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const { setModalContent } = useModalContext();
  const router = useRouter();

  const [
    clearProgress,
    {
      isSuccess: progressCleared,
      error: errorClearingProgress,
      isLoading: progressClearing,
    },
  ] = useSaveProgressMutation();

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
      setModalContent(<AppLoader />);
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

  return (
    <>
      <AppHead title="Multiple Choice" />

      <AppLayout>
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
                    <MCQItemContainerPDF
                      data={data.data}
                      title={capitalizeFirstLetterOfEachWord(
                        data.documentTitle.toLowerCase()
                      )}
                    />
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
        {data && (
          <>
            <h1 className="text-center text-xl font-semibold">
              {capitalizeFirstLetterOfEachWord(
                data.documentTitle.toLowerCase()
              )}{" "}
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
          </>
        )}
        <div>
          {data && (
            <MCQContainer
              data={data.data}
              handleDone={() => {
                router.push(`/questions/view-questions/${data.documentId}`);
              }}
              isSubmitted={isSubmitted}
              handleSubmitted={(value) => {
                setIsSubmitted(value);
              }}
              documentId={data.documentId}
              title={capitalizeFirstLetterOfEachWord(
                data.documentTitle.toLowerCase()
              )}
            />
          )}
        </div>
      </AppLayout>
    </>
  );
};

export default Practice;
