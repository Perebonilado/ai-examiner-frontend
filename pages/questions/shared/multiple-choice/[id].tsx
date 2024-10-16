import MCQContainer from "@/@modules/questions/MCQContainer";
import AppHead from "@/@shared/components/AppHead";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useGetSharedQuestionQuery } from "@/api-services/shared-questions.service";
import { accessToken } from "@/constants";
import Cookies from "js-cookie";
import WebLayout from "@/layouts/WebLayout";

const MultipleChoiceShared: NextPage = () => {
  const [id, setId] = useState("");
  const params = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = Cookies.get(accessToken);

    if (isLoggedIn) {
      setIsUserLoggedIn(true);
    }
  }, []);

  const { setModalContent } = useModalContext();
  const router = useRouter();

  const { data, error, refetch, isLoading } = useGetSharedQuestionQuery(
    { questionId: id },
    { skip: !id, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (params) {
      setId(params.id as string);
    }
  }, [params]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader loaderMessage="Loading Questions" />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  return (
    <LayoutToUse>
      <AppHead title="Multiple Choice" />

      {!data && error && (
        <div className="flex flex-col gap-4 justify-center items-center py-8">
          <ErrorMessage message="Something went wrong while trying to get questions" />
          <Button title="Reload Questions" onClick={refetch} />
        </div>
      )}

      {data && (
        <>
          <h1 className="text-center text-xl font-semibold">
            {capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())}{" "}
          </h1>
          <p className="text-center text-sm text-gray-500 my-3">
            Shared By:{" "}
            {capitalizeFirstLetterOfEachWord(
              `${data.sharedBy.lastName} ${data.sharedBy.firstname}`
            )}
          </p>
        </>
      )}

      <div className="min-h-[70vh]">
        {data && (
          <MCQContainer
            data={data.data}
            handleDone={() => {
              if (isUserLoggedIn) {
                router.push("/documents");
              } else {
                router.push("/auth/login");
              }
            }}
            isSubmitted={isSubmitted}
            handleSubmitted={(value) => {
              setIsSubmitted(value);
            }}
            allowNotSure={false}
            allowSaveProgress={false}
            allowSaveScore={false}
            documentId={""}
            title={capitalizeFirstLetterOfEachWord(
              data.documentTitle.toLowerCase()
            )}
          />
        )}
      </div>
    </LayoutToUse>
  );
};

export default MultipleChoiceShared;

const LayoutToUse: FC<PropsWithChildren> = ({ children }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = Cookies.get(accessToken);

    if (isLoggedIn) {
      setIsUserLoggedIn(true);
    }
  }, []);

  if (isUserLoggedIn) return <AppLayout>{children}</AppLayout>;

  return <WebLayout>{children}</WebLayout>;
};
