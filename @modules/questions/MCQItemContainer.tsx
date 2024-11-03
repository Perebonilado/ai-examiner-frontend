import Container from "@/@shared/ui/Container";
import { QuestionOption, QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MCQItem from "./MCQItem";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import SubmissionModal from "./SubmissionModal";
import { toast } from "react-toastify";
import { useSaveScoreMutation } from "@/api-services/questions.service";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useParams } from "next/navigation";
import {
  useGetProgressQuery,
  useSaveProgressMutation,
} from "@/api-services/question-progress.service";
import { useSpeechToText } from "@/hooks/useSpeechToText";

interface Props {
  data: QuestionsModel[];
  handleDone: () => void;
  documentId: string;
  title: string;
  isSubmitted: boolean;
  handleSubmitted: (value: boolean) => void;
  handleShowSubmissionModal: ({
    title,
    score,
  }: {
    title: string;
    score: number;
  }) => void;
  allowSaveProgress?: boolean;
  allowSaveScore?: boolean;
  allowNotSure?: boolean;
}

const MCQItemContainer: FC<Props> = ({
  data,
  handleDone,
  documentId,
  title,
  isSubmitted,
  handleShowSubmissionModal,
  handleSubmitted,
  allowSaveProgress = true,
  allowNotSure = true,
  allowSaveScore = true,
}) => {
  const [questionAnswerMap, setQuestionAnswerMap] = useState<Record<
    string,
    boolean
  > | null>(null);

  const [questionId, setQuestionId] = useState("");

  const params = useParams();

  useEffect(() => {
    if (params.id) setQuestionId(params.id as string);
  }, [params]);

  const { setModalContent } = useModalContext();

  const [resetAllSelectionsTrigger, setResetAllSelectionsTrigger] =
    useState(false);

  const [saveScore, { isLoading, isSuccess }] = useSaveScoreMutation();
  const [submitProgress, {}] = useSaveProgressMutation();

  const { data: progress } = useGetProgressQuery(
    { id: questionId },
    { skip: !questionId || !allowSaveProgress, refetchOnMountOrArgChange: true }
  );

  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setModalContent(
        <AppLoader loaderMessage="Just a moment while we evaluate your score" />
      );
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess && !isLoading) {
      handleShowSubmissionModal({ title, score: calculateScorePercentage() });
    }
  }, [isSuccess, isLoading]);

  const handleSetQuestionAnswerMap = () => {
    const map: Record<string, boolean> = {};

    if (progress?.data && data) {
      for (const item of progress.data) {
        const questionInfo = data.find(
          (q) => q?.id === item?.selectedQuestionId
        );
        const answerEvaluation =
          item?.selectedOptionId === questionInfo?.correctAnswerId
            ? true
            : false;
        map[`${item.selectedQuestionId}`] = answerEvaluation;
      }

      setQuestionAnswerMap(map);
    }
  };

  useEffect(() => {
    if (progress?.data && data) {
      handleSetQuestionAnswerMap();
    }
  }, [progress, data]);

  const handleSetQuestionAnswerMapItem = (id: string, value: boolean) => {
    const newMap = { ...questionAnswerMap };
    newMap[id] = value;
    setQuestionAnswerMap(newMap);
  };

  const calculateScorePercentage = () => {
    if (questionAnswerMap) {
      const answersArr = Object.values(questionAnswerMap);

      const totalQuestions = data.length;

      const totalCorrectAnswers = answersArr.filter((ans) => ans).length;

      const scorePercentage = (totalCorrectAnswers / totalQuestions) * 100;

      return scorePercentage;
    }

    return 0;
  };

  useEffect(() => {
    if (progress && progress.status === "submitted") {
      handleSubmitted(true);
    }
  }, [progress]);

  const { speak } = useSpeechToText();

  return (
    <section>
      <div className="mt-3 mb-12 flex items-center justify-center">
        {isSubmitted && (
          <Button
            title="View Score"
            variant="text"
            onClick={() => {
              handleShowSubmissionModal({
                title,
                score: calculateScorePercentage(),
              });
            }}
          />
        )}
      </div>
      <Container className="pb-10">
        <div className="flex flex-col gap-[80px]">
          {data.map((question, idx) => {
            const selectedInProgress =
              progress?.data?.find(
                (p) => p.selectedQuestionId === question.id
              ) ?? null;
            const selectedAnswer: QuestionOption | null = selectedInProgress
              ? {
                  id:
                    question.options.find(
                      (opt) => opt.id === selectedInProgress.selectedOptionId
                    )?.id || "",
                  value:
                    question.options.find(
                      (opt) => opt.id === selectedInProgress.selectedOptionId
                    )?.value || "",
                }
              : null;
            return (
              <MCQItem
                {...question}
                key={question.id}
                questionNumber={idx + 1}
                totalQuestionsCount={data.length}
                selectedOptionFromProgress={selectedAnswer ?? null}
                handleSetQuestionAnswer={handleSetQuestionAnswerMapItem}
                submitted={isSubmitted}
                isResetSelection={resetAllSelectionsTrigger}
                documentId={documentId}
                speak={speak}
                allowSaveProgress={allowSaveProgress}
                allowNotSure={allowNotSure}
              />
            );
          })}
        </div>

        <div className="flex justify-end gap-4 w-full max-w-[800px] mx-auto py-8">
          {!isSubmitted ? (
            <>
              <Button
                title="Submit"
                size="large"
                onClick={() => {
                  handleSubmitted(true);

                  setCalculatedScore(calculateScorePercentage());

                  if (allowSaveScore) {
                    saveScore({
                      documentId: documentId,
                      questionId,
                      score: calculateScorePercentage(),
                    });
                  } else {
                    handleShowSubmissionModal({
                      title,
                      score: calculateScorePercentage(),
                    });
                  }

                  if (allowSaveProgress) {
                    submitProgress({
                      clearExistingProgress: false,
                      id: questionId,
                      status: "submitted",
                    });
                  }
                }}
              />
            </>
          ) : (
            <div>
              <Button
                title="Done"
                onClick={handleDone}
                size="large"
                variant="outlined"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default MCQItemContainer;
