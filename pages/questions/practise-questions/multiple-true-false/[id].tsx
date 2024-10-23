import MultipleTrueFalseCard from "@/@modules/questions/MultipleTrueFalseCard";
import MultipleTrueFalseCardContainer from "@/@modules/questions/MultipleTrueFalseCardContainer";
import MultipleTrueFalseItem from "@/@modules/questions/MultipleTrueFalseItem";
import AppHead from "@/@shared/components/AppHead";
import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import IconButton from "@/@shared/ui/IconButton";
import { useGetQuestionsByIdQuery } from "@/api-services/questions.service";
import ChevronLeft from "@/icons/ChevronLeft";
import DotsIcon from "@/icons/DotsIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import * as moment from "moment";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { GetMultipleTrueFalseQuestionByIdModel } from "@/models/questions.model";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";

const MultipleTrueFalse: NextPage = () => {
  const [id, setId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { setModalContent } = useModalContext();

  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

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

          {/* <IconButton
            icon={<DotsIcon />}
            title="More"
            onClick={() => {
              setModalContent(
                <Dialog>
                  <MCQItemContainerPDF
                    data={(data as GetQuestionByIdModel).data}
                    title={capitalizeFirstLetterOfEachWord(
                      data.documentTitle.toLowerCase()
                    )}
                    handleCopyShareLink={handleCopyShareLink}
                  />
                </Dialog>
              );
            }}
          /> */}
        </div>
      )}
      {!data && error && (
        <div className="flex flex-col gap-4 justify-center items-center py-8">
          <ErrorMessage message="Something went wrong while trying to get questions" />
          <Button title="Reload Questions" onClick={refetch} />
        </div>
      )}
      {data && (
        <div className="mb-12">
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
                // onClick={handleResetAnswers}
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
        />
      )}
    </AppLayout>
  );
};

export default MultipleTrueFalse;
