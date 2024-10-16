import { accessToken } from "@/constants";
import AppLayout from "@/layouts/AppLayout";
import WebLayout from "@/layouts/WebLayout";
import { NextPage } from "next";
import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import { useGetSharedQuestionQuery } from "@/api-services/shared-questions.service";
import { AppLoader } from "@/@shared/components/AppLoader";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import Button from "@/@shared/ui/Button";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import FlashCardItemContainer from "@/@modules/questions/FlashCardItemContainer";

const FlashcardsShared: NextPage = () => {
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
    <LayoutToUse isLoggedIn={isUserLoggedIn}>
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
          <p className="text-center text-sm text-gray-500 my-3">
            Shared By:{" "}
            {capitalizeFirstLetterOfEachWord(
              `${data.sharedBy.lastName} ${data.sharedBy.firstname}`
            )}
          </p>
        </>
      )}

      <div className="mt-14 mb-14 min-h-[75vh]">
        {data && (
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
              if (isUserLoggedIn) {
                router.push("/documents");
              } else {
                router.push("/auth/login");
              }
            }}
          />
        )}
      </div>
    </LayoutToUse>
  );
};

export default FlashcardsShared;

const LayoutToUse: FC<PropsWithChildren<{ isLoggedIn: boolean }>> = ({
  children,
  isLoggedIn,
}) => {
  if (!isLoggedIn) return <WebLayout>{children}</WebLayout>;

  return <AppLayout>{children}</AppLayout>;
};
