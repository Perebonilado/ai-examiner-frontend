import MCQContainer from "@/@modules/questions/MCQContainer";
import { AppLoader } from "@/@shared/components/AppLoader";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetQuestionsByIdQuery } from "@/api-services/questions.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Practice: NextPage = () => {
  const [id, setId] = useState("");
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const { setModalContent } = useModalContext();

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
    <AppLayout>
      {!data && error && (
        <div className="flex flex-col gap-4 justify-center items-center py-8">
          <ErrorMessage message="Something went wrong while trying to get questions" />
          <Button title="Reload Questions" onClick={refetch} />
        </div>
      )}
      {data && (
        <h1 className="text-center mb-6 text-xl font-semibold">
          {data.topicTitle} Multiple Choice Questions
        </h1>
      )}
      <div>
        {data && (
          <MCQContainer data={data.data} handeGenerateNewQuestions={() => {}} />
        )}
      </div>
    </AppLayout>
  );
};

export default Practice;
