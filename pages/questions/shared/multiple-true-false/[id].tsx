import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import Cookies from "js-cookie";
import AppLayout from "@/layouts/AppLayout";
import WebLayout from "@/layouts/WebLayout";
import { accessToken } from "@/constants";
import { useParams } from "next/navigation";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import { useGetSharedQuestionQuery } from "@/api-services/shared-questions.service";
import { AppLoader } from "@/@shared/components/AppLoader";
import AppHead from "@/@shared/components/AppHead";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import Button from "@/@shared/ui/Button";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import MultipleTrueFalseCardContainer from "@/@modules/questions/MultipleTrueFalseCardContainer";
import { GetMultipleTrueFalseQuestionByIdModel } from "@/models/questions.model";

const SharedMultipleTrueFalse: FC = () => {
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
          <MultipleTrueFalseCardContainer
            data={
              (data as unknown as GetMultipleTrueFalseQuestionByIdModel).data
            }
            submitted={isSubmitted}
            title={data.documentTitle}
            handleSubmitted={() => {
              setIsSubmitted(true);
            }}
            allowNotSure={false}
            allowSaveProgress={false}
            allowSaveScore={false}
            documentId={""}
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

export default SharedMultipleTrueFalse;

const LayoutToUse: FC<PropsWithChildren<{ isLoggedIn: boolean }>> = ({
  children,
  isLoggedIn,
}) => {
  if (!isLoggedIn) return <WebLayout>{children}</WebLayout>;

  return <AppLayout>{children}</AppLayout>;
};
