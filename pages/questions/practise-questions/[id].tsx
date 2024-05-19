import MCQContainer from "@/@modules/questions/MCQContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
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
import * as moment from 'moment';

const Practice: NextPage = () => {
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
      <AppHead title="Practice Questions" />
      <AppLayout>
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get questions" />
            <Button title="Reload Questions" onClick={refetch} />
          </div>
        )}
        {data && (
          <>
          <h1 className="text-center mb-3 text-xl font-semibold">
            {capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())}{" "}
            Questions
          </h1>
          <p className="text-center text-sm text-gray-500">Date Created: {moment.utc(data.createdOn).local().format('MMMM D, YYYY h:mma')}</p>
          </>
        )}
        <div>
          {data && (
            <MCQContainer
              data={data.data}
              handleDone={() => {
                router.push(`/questions/view-questions/${data.documentId}`);
              }}
            />
          )}
        </div>
      </AppLayout>
    </>
  );
};

export default Practice;
