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
import Container from "@/@shared/ui/Container";

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
      <Container>
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get questions" />
            <Button title="Reload Questions" onClick={refetch} />
          </div>
        )}

        {data && (
          <div className="mx-auto w-full max-w-[680px] pt-2 pb-14">
            <header className="mb-5">
              <h1 className="text-2xl leading-[1.25] font-bold tracking-[-0.015em] text-ink [text-wrap:balance] max-md:text-xl">
                {capitalizeFirstLetterOfEachWord(
                  data.documentTitle.toLowerCase()
                )}{" "}
                Questions
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-subtle">
                <span>Flashcards</span>
                <span aria-hidden className="w-[3px] h-[3px] rounded-full bg-control" />
                <span>
                  {data.data.length} {data.data.length === 1 ? "card" : "cards"}
                </span>
                <span aria-hidden className="w-[3px] h-[3px] rounded-full bg-control" />
                <span>
                  Shared by{" "}
                  {capitalizeFirstLetterOfEachWord(
                    `${data.sharedBy.lastName} ${data.sharedBy.firstname}`
                  )}
                </span>
              </p>
            </header>

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
          </div>
        )}
      </Container>
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
