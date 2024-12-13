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
import QuestionSettingsDialog from "./QuestionSettingsDialog";
import CountdownTimer from "./CountDownTimer";

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
  handleGenerateMoreQuestions?: () => void;
  allowMoreQuestionGeneration?: boolean;
  allowSaveProgress?: boolean;
  allowSaveScore?: boolean;
  allowNotSure?: boolean;
  allowViewSource?: boolean;
}

const MCQItemContainer: FC<Props> = ({
  data,
  handleDone,
  documentId,
  title,
  isSubmitted,
  handleShowSubmissionModal,
  handleSubmitted,
  handleGenerateMoreQuestions,
  allowMoreQuestionGeneration = false,
  allowSaveProgress = true,
  allowNotSure = true,
  allowSaveScore = true,
  allowViewSource = true,
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
  const [submitProgress, {isLoading: progressLoading, isSuccess: progressSuccess }] = useSaveProgressMutation();

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
    if (isSuccess && !isLoading && progressSuccess && !progressLoading) {
      handleShowSubmissionModal({ title, score: calculateScorePercentage() });
    }
  }, [isSuccess, isLoading, progressLoading, progressSuccess]);

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

  const [isNegativeMarking, setIsNegativeMarking] = useState(false);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (
      data &&
      progress &&
      progress?.status !== "submitted" &&
      !progress?.data?.length
    ) {
      setModalContent(
        <QuestionSettingsDialog
          handleBeginTest={(selectedTime, isNegativeMarking) => {
            setIsNegativeMarking(isNegativeMarking);
            setTimeLeftSeconds(selectedTime);
            setTotalDuration(Number(selectedTime));

            setModalContent(null);
          }}
          maxTimeForEachQuestionInSeconds={30}
          numberOfQuestions={data.length}
        />
      );
    }
  }, [data, progress]);

  const resetTimer = () => {
    if (interval) {
      clearInterval(interval);
      setTimeLeftSeconds(null);
      setTotalDuration(null);
    }
  };

  const submitTest = () => {
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
  };

  let interval: NodeJS.Timeout | null;

  useEffect(() => {
    if (timeLeftSeconds) {
      interval = setInterval(() => {
        if (timeLeftSeconds === 1 && interval) {
          resetTimer();

          submitTest();
        }

        const newTimeLeft = timeLeftSeconds - 1;
        setTimeLeftSeconds(newTimeLeft);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeLeftSeconds]);

  const calculateScorePercentage = () => {
    if (questionAnswerMap) {
      const answersArr = Object.values(questionAnswerMap);

      const totalQuestions = data.length;

      const totalCorrectAnswers = answersArr.filter((ans) => ans).length;
      const totalWrongAnswers = answersArr.filter(
        (ans) => ans === false
      ).length;

      let scorePercentage = 0;

      if (isNegativeMarking) {
        const totalCorrect = totalCorrectAnswers - totalWrongAnswers;
        scorePercentage = (totalCorrect / totalQuestions) * 100;
      } else {
        scorePercentage = (totalCorrectAnswers / totalQuestions) * 100;
      }

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
      {timeLeftSeconds && totalDuration ? (
        <CountdownTimer
          timeLeft={timeLeftSeconds}
          totalDuration={totalDuration}
        />
      ) : null}
      <div className="mt-3 mb-12 flex flex-col gap-3 mx-auto w-full max-w-[300px] items-center justify-center">
        {isSubmitted && allowMoreQuestionGeneration && (
          <Button
            title="New Questions"
            onClick={() => {
              if (handleGenerateMoreQuestions) {
                handleGenerateMoreQuestions();
              }
            }}
            fullWidth
            size="large"
            variant="outlined"
          />
        )}
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
                allowViewSource={allowViewSource}
              />
            );
          })}
        </div>

        <div className="flex justify-end gap-4 w-full max-w-[800px] mx-auto py-8">
          {!isSubmitted ? (
            <div className="flex max-sm:w-full items-center justify-center gap-4 max-sm:flex-col-reverse">
              {allowMoreQuestionGeneration &&
                !timeLeftSeconds &&
                !totalDuration && (
                  <Button
                    title="New Questions"
                    onClick={() => {
                      if (handleGenerateMoreQuestions) {
                        handleGenerateMoreQuestions();
                      }
                    }}
                    size="large"
                    variant="outlined"
                    className="max-sm:w-full"
                  />
                )}
              <Button
                title="Submit"
                size="large"
                className="max-sm:w-full"
                onClick={() => {
                  resetTimer();
                  submitTest();
                }}
              />
            </div>
          ) : (
            <div className="flex max-sm:flex-col-reverse max-sm:w-full max-sm:justify-center items-center gap-3">
              {allowMoreQuestionGeneration && (
                <Button
                  title="New Questions"
                  onClick={() => {
                    if (handleGenerateMoreQuestions) {
                      handleGenerateMoreQuestions();
                    }
                  }}
                  size="large"
                  variant="outlined"
                  className="max-sm:w-full"
                />
              )}
              <Button
                className="max-sm:w-full"
                title="Done"
                onClick={handleDone}
                size="large"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default MCQItemContainer;
