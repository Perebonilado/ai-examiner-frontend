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

const Essay: NextPage = () => {
  const [id, setId] = useState("");
  const params = useParams();
  const [documentId, setdocumentId] = useState<string>("");
  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

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

  return (
    <>
      <AppHead title="Essay" />

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
          </>
        )}
        {data && !analysisData?.data?.length && (
          <EssayItemContainer
            data={(data as GetQuestionByIdModel).data}
            documentId={documentId}
            questionId={id}
            submitTest={submitTest}
          />
        )}

        {analysisData && analysisData.data && (
          <div className="w-full max-w-[900px] mx-auto mt-10">
            {analysisData.data.map((analysis, idx) => {
              return (
                <EssayAnalysisItemAccordion
                  key={idx}
                  {...analysis}
                  questionNumber={idx + 1}
                  totalQuestions={analysisData.data.length}
                />
              );
            })}

            <div>
                
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default Essay;
