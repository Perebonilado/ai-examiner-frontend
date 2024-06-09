import FlashCardItemContainer from "@/@modules/questions/FlashCardItemContainer";
import AppHead from "@/@shared/components/AppHead";
import { useGetQuestionsByIdQuery } from "@/api-services/questions.service";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import Button from "@/@shared/ui/Button";
import ChevronLeft from "@/icons/ChevronLeft";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import * as moment from "moment";

const FlashCards: NextPage = () => {
  const [id, setId] = useState("");
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const { setModalContent } = useModalContext();
  const router = useRouter();

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
      setId(params.id as string);
    }
  }, [params]);

  return (
    <>
      <AppHead title="Flash Cards" />
      <AppLayout>
        {data && (
          <Button
            title="Back"
            variant="text"
            starticon={<ChevronLeft />}
            className="!gap-1 mb-6 mt-7"
            onClick={() => {
              router.push(`/questions/view-questions/${data?.documentId}`);
            }}
          />
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
              data={data.data.map((d) => {
                const answer = d.options.find(
                  (opt) => opt.id === d.correctAnswerId
                )?.value;
                return {
                  question: d.question,
                  answer: answer || "",
                  hint: d.hint,
                };
              })}
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
