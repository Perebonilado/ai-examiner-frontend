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
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { AppLoader } from "@/@shared/components/AppLoader";
import { toast } from "react-toastify";
import { GetQuestionByIdModel } from "@/models/questions.model";
import { useGetAllSavedDocumentTopicsQuery, useGetAllSavedDocumentTopicsV2Query } from "@/api-services/document-topic.service";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";
import { useDispatch } from "react-redux";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
} from "@/features/documentChatSlice";
import { openNewTestForm } from "@/features/newTestSlice";
import { capitalizeFirstLetterOfEachWord } from "@/utils";

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

  const documentTitle = data?.documentTitle
    ? capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())
    : "";

  return (
    <>
      <AppHead title="Flash Cards" />
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
          { label: "Flashcards" },
        ]}
        mobileTitle="Flashcards"
      >
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get questions" />
            <Button title="Reload Questions" onClick={refetch} />
          </div>
        )}

        {data && (
          <div className="mx-auto w-full max-w-[680px]">
            <header className="mb-5">
              <h1 className="text-2xl leading-[1.25] font-bold tracking-[-0.015em] text-ink [text-wrap:balance] max-md:text-xl">
                {documentTitle}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-subtle">
                <span>Flashcards</span>
                <span aria-hidden className="w-[3px] h-[3px] rounded-full bg-control" />
                <span>
                  {(data as GetQuestionByIdModel).data.length}{" "}
                  {(data as GetQuestionByIdModel).data.length === 1 ? "card" : "cards"}
                </span>
              </p>
            </header>

            <FlashCardItemContainer
              data={(data as GetQuestionByIdModel).data.map((d) => {
                return {
                  question: d.question,
                  answer: d.options[0].value,
                  hint: d.hint,
                };
              })}
              allowMoreQuestionGeneration={true}
              handleGenerateMoreQuestions={handleNewTest}
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
