import { MultipleTrueFalseQuestionModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MultipleTrueFalseCard from "./MultipleTrueFalseCard";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import SubmissionModal from "./SubmissionModal";
import { useSaveScoreMutation } from "@/api-services/questions.service";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useParams } from "next/navigation";
import {
  useGetProgressQuery,
  useSaveProgressMutation,
} from "@/api-services/question-progress.service";
import { QuestionProgressModel } from "@/models/question-progress.model";
import QuestionSettingsDialog from "./QuestionSettingsDialog";
import CountdownTimer from "./CountDownTimer";

interface Props {
  data: MultipleTrueFalseQuestionModel[];
  submitted: boolean;
  title: string;
  handleSubmitted: () => void;
  handleDone: () => void;
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
  documentId: string;
}

interface QuestionAnswerMap {
  [questionNumber: number]: {
    [optionId: string]: {
      isCorrect: boolean;
    };
  };
}

const MultipleTrueFalseCardContainer: FC<Props> = ({
  data,
  submitted,
  title,
  handleSubmitted,
  allowSaveProgress = true,
  allowNotSure = true,
  allowSaveScore = true,
  handleShowSubmissionModal,
  handleDone,
  documentId,
  handleGenerateMoreQuestions,
  allowMoreQuestionGeneration = false,
}) => {
  const [questionAnswerMap, setQuestionAnswerMap] =
    useState<QuestionAnswerMap | null>(null);

  const [submitProgress, {}] = useSaveProgressMutation();

  const { setModalContent } = useModalContext();

  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  const [questionId, setQuestionId] = useState("");

  const params = useParams();

  const { data: progress, isLoading: progressLoading, isSuccess: progressSuccess } = useGetProgressQuery(
    { id: questionId },
    { skip: !questionId || !allowSaveProgress, refetchOnMountOrArgChange: true }
  );

  const handleSetQuestionAnswerMap = () => {
    if (progress && progress?.data && data) {
      // get the questions that have been answered
      const answeredQuestionIds = Array.from(
        new Set(progress.data.map((d) => d.selectedQuestionId))
      );

      // initialize an object to add the answered progress
      const newQuestionAnswerMapItem: QuestionAnswerMap = {};

      answeredQuestionIds.forEach((questionId) => {
        // get the question number
        const questionNumber = data.findIndex((q) => q.id === questionId) + 1;
        newQuestionAnswerMapItem[questionNumber] = {};

        // get the users answering progress for current question
        const questionAnswers = progress.data.filter(
          (qa) => qa.selectedQuestionId === questionId
        );

        for (const selectionOption of questionAnswers) {
          // get the option from data to evaluate if user selected correct answer
          const optionFromData = data
            .filter((d) => d.id === questionId)[0]
            ?.options.filter(
              (options) => options.id === selectionOption.selectedOptionId
            );
          const isCorrect =
            optionFromData[0]?.answer === selectionOption.selectedAnswer;

          // add progress to new map//
          newQuestionAnswerMapItem[questionNumber] = {
            ...newQuestionAnswerMapItem[questionNumber],
            [selectionOption.selectedOptionId]: {
              isCorrect,
            },
          };
        }
      });

      setQuestionAnswerMap(newQuestionAnswerMapItem);
    }
  };

  useEffect(() => {
    if (params.id) setQuestionId(params.id as string);
  }, [params]);

  useEffect(() => {
    if (progress?.data && data) {
      handleSetQuestionAnswerMap();
    }
  }, [progress, data]);

  const calculateScorePercentage = () => {
    if (questionAnswerMap) {
      const scoreValues = Object.values(questionAnswerMap);
      const totalScoreForEachQuestion = scoreValues.map((score) => {
        let totalWrongScore = 0;
        let totalCorrectScore = 0;
        for (const key in score) {
          if (score[key].isCorrect) {
            totalCorrectScore += 1;
          } else {
            totalWrongScore += 1;
          }
        }

        return { totalCorrectScore, totalWrongScore };
      });

      const totalCorrectScoreForAnsweredQuestions =
        totalScoreForEachQuestion.reduce((a, b) => a + b.totalCorrectScore, 0);

      const totalWrongScoreForAnsweredQuestions =
        totalScoreForEachQuestion.reduce((a, b) => a + b.totalWrongScore, 0);

      const weightOfEachQuestion = 4;
      const totalQuestions = data.length * weightOfEachQuestion;

      let finalScore = 0;

      if (isNegativeMarking) {
        const totalScore =
          totalCorrectScoreForAnsweredQuestions -
          totalWrongScoreForAnsweredQuestions;
        finalScore = (totalScore / totalQuestions) * 100;
      } else {
        finalScore =
          (totalCorrectScoreForAnsweredQuestions / totalQuestions) * 100;
      }

      return finalScore;
    }

    return 0;
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
          maxTimeForEachQuestionInSeconds={40}
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
    handleSubmitted();

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

  const [saveScore, { isLoading, isSuccess }] = useSaveScoreMutation();

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
    if (isSuccess && !isLoading && !progressLoading && progressSuccess) {
      handleShowSubmissionModal({ title, score: calculateScorePercentage() });
    }
  }, [isSuccess, isLoading, progressLoading, progressSuccess]);

  useEffect(() => {
    if (progress && progress.status === "submitted") {
      handleSubmitted();
    }
  }, [progress]);

  return (
    <>
      {timeLeftSeconds && totalDuration ? (
        <CountdownTimer
          timeLeft={timeLeftSeconds}
          totalDuration={totalDuration}
        />
      ) : null}
      <div className="mt-3 mb-12 mx-auto w-full max-w-[300px] flex flex-col gap-3 items-center justify-center">
        {submitted && allowMoreQuestionGeneration && (
          <Button
            title="New Questions"
            onClick={() => {
              if (handleGenerateMoreQuestions) {
                handleGenerateMoreQuestions();
              }
            }}
            size="large"
            variant="outlined"
            fullWidth
          />
        )}
        {submitted && (
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
      <section className="flex flex-col gap-12">
        {data.map((d, idx) => {
          const questionProgress =
            progress?.data?.filter((p) => p.selectedQuestionId === d.id) ||
            null;
          return (
            <MultipleTrueFalseCard
              {...d}
              questionNumber={idx + 1}
              questionId={questionId}
              totalQuestionsCount={data.length}
              submitted={submitted}
              progress={questionProgress}
              allowSaveProgress={allowSaveProgress}
              handleSetQuestionAnswer={({
                id,
                questionIndex,
                selectedAnswer,
                correctAnswer,
              }) => {
                const newQuestionAnswerMap = questionAnswerMap
                  ? { ...questionAnswerMap }
                  : ({} as QuestionAnswerMap);

                newQuestionAnswerMap[questionIndex] = {
                  ...newQuestionAnswerMap[questionIndex],
                  [id]: {
                    isCorrect: selectedAnswer === correctAnswer,
                  },
                };

                setQuestionAnswerMap(newQuestionAnswerMap);
              }}
            />
          );
        })}

        <div className="flex justify-end gap-4 w-full max-w-[800px] mx-auto py-8">
          {!submitted ? (
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
      </section>
    </>
  );
};

export default MultipleTrueFalseCardContainer;
