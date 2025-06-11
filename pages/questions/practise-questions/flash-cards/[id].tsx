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
import { useDispatch } from "react-redux";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
  setMessages,
} from "@/features/documentChatSlice";
import TestPageTitle from "@/@modules/questions/TestPageTitle";

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
      <AppLayout
        handleBack={() => {
          router.push(`/questions/view-questions/${data?.documentId}`);
        }}
      >
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get questions" />
            <Button title="Reload Questions" onClick={refetch} />
          </div>
        )}

        {data && (
          <>
            <TestPageTitle
              handleBack={() => {
                router.push(`/questions/view-questions/${data?.documentId}`);
              }}
              title={data.documentTitle.toLowerCase()}
              handleCopyShareLink={handleCopyShareLink}
            />
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
