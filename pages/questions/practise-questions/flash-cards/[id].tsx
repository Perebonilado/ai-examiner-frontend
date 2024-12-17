import FlashCardItemContainer from "@/@modules/questions/FlashCardItemContainer";
import AppHead from "@/@shared/components/AppHead";
import { useGetQuestionsByIdQuery } from "@/api-services/questions.service";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import Button from "@/@shared/ui/Button";
import ChevronLeft from "@/icons/ChevronLeft";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import * as moment from "moment";
import { AppLoader } from "@/@shared/components/AppLoader";
import { toast } from "react-toastify";
import IconButton from "@/@shared/ui/IconButton";
import DotsIcon from "@/icons/DotsIcon";
import Dialog from "@/@shared/components/Dialog";
import ShareIcon from "@/icons/ShareIcon";
import ShareQuestionDialog from "@/@modules/questions/ShareQuestionDialog";
import { GetQuestionByIdModel } from "@/models/questions.model";
import { useGetAllSavedDocumentTopicsQuery } from "@/api-services/document-topic.service";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";

const FlashCards: NextPage = () => {
  const [id, setId] = useState("");
  const [documentId, setdocumentId] = useState<string>("");
  const params = useParams();
  const { data, error, refetch, isLoading } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const { setModalContent } = useModalContext();
  const router = useRouter();

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

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  const handleCopyShareLink = () => {
    try {
      navigator.clipboard.writeText(
        `${window.location.origin}/questions/shared/flash-cards/${id}`
      );

      toast.success("Copied to clipboard");
      setModalContent(null);
    } catch (error) {
      toast.error(`Oops! Let's try that again`);
      setModalContent(null);
    }
  };

  return (
    <>
      <AppHead title="Flash Cards" />
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

        {data && (
          <>
            <h1 className="text-center mb-3 text-xl font-semibold">
              {capitalizeFirstLetterOfEachWord(
                data.documentTitle.toLowerCase()
              )}{" "}
              Questions
            </h1>
            <p className="text-center text-sm text-gray-500">
              Date Created:{" "}
              {moment.utc(data.createdOn).local().format("MMMM D, YYYY h:mma")}
            </p>
          </>
        )}

        {data && (
          <div className="mt-14">
            <FlashCardItemContainer
              data={(data as GetQuestionByIdModel).data.map((d) => {
                
                return {
                  question: d.question,
                  answer: d.options[0].value,
                  hint: d.hint,
                };
              })}
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
              handleDone={() => {
                router.push(`/questions/view-questions/${data?.documentId}`);
              }}
            />
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default FlashCards;
