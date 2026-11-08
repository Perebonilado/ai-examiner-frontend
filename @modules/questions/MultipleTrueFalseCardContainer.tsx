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
import { ActionBar, actionButtonClassName, ResultRow } from "./TestUI";

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
  /** Restart (clear progress); shown in the result row after submitting. */
  handleRestart?: () => void;
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
  handleRestart,
}) => {
  const [questionAnswerMap, setQuestionAnswerMap] =
    useState<QuestionAnswerMap | null>(null);

  const [
    submitProgress,
    { isLoading: progressSubmitting, data: progressSubmitted, isError: progressSubmittingError },
  ] = useSaveProgressMutation();

  const { setModalContent } = useModalContext();

  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  const [questionId, setQuestionId] = useState("");

  const params = useParams();

  const {
    data: progress,
    isLoading: progressLoading,
    isSuccess: progressSuccess,
  } = useGetProgressQuery(
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
          maxTimeForEachQuestionInSeconds={90}
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
    if (isSuccess && !isLoading) {
      if (allowSaveProgress) {
        setModalContent(<AppLoader loaderMessage="Submitting progress" />);
        submitProgress({
          clearExistingProgress: false,
          id: questionId,
          status: "submitted",
        });
      } else {
        handleShowSubmissionModal({
          title,
          score: calculateScorePercentage(),
        });
      }
    }
  }, [isSuccess, isLoading]);

  useEffect(() => {
    if (
      !progressSubmitting &&
      progressSubmitted &&
      progressSubmitted?.status == "submitted"
    ) {
      setModalContent(null)
      handleShowSubmissionModal({
        title,
        score: calculateScorePercentage(),
      });
    }
  }, [progressSubmitting, progressSubmitted]);

  useEffect(()=>{
    if(progressSubmittingError){
      setModalContent(null)
    }
  },[progressSubmittingError])

  useEffect(() => {
    if (progress && progress.status === "submitted") {
      handleSubmitted();
    }
  }, [progress]);

  // Statement counts for the progress pill and result row (deduplicated by statement id).
  const statementResults = new Map<string, boolean>();
  if (questionAnswerMap) {
    Object.values(questionAnswerMap).forEach((answers) => {
      Object.keys(answers).forEach((optionId) => {
        statementResults.set(optionId, answers[optionId].isCorrect);
      });
    });
  }
  const totalStatements = data.reduce((sum, q) => sum + q.options.length, 0);
  const answeredStatements = statementResults.size;
  const correctStatements = Array.from(statementResults.values()).filter(
    Boolean
  ).length;

  const handleNewTest = () => {
    if (handleGenerateMoreQuestions) {
      handleGenerateMoreQuestions();
    }
  };

  return (
    <>
      {!submitted && (
        <CountdownTimer
          timeLeft={timeLeftSeconds && totalDuration ? timeLeftSeconds : null}
          totalDuration={totalDuration}
          answered={answeredStatements}
          total={totalStatements}
        />
      )}

      {submitted && (
        <ResultRow
          percentage={calculateScorePercentage()}
          correct={correctStatements}
          total={totalStatements}
          handleRestart={handleRestart}
          handleNewTest={allowMoreQuestionGeneration ? handleNewTest : undefined}
          handleViewScore={() => {
            handleShowSubmissionModal({
              title,
              score: calculateScorePercentage(),
            });
          }}
        />
      )}

      <section className="flex flex-col gap-7">
        {data.map((d, idx) => {
          const questionProgress =
            progress?.data?.filter((p) => p.selectedQuestionId === d.id) ||
            null;
          return (
            <MultipleTrueFalseCard
              {...d}
              key={d.id}
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
      </section>

      <ActionBar>
        {!submitted ? (
          <>
            {allowMoreQuestionGeneration && !timeLeftSeconds && !totalDuration && (
              <Button
                title="New test"
                onClick={handleNewTest}
                size="large"
                variant="outlined"
              />
            )}
            <Button
              title="Submit"
              size="large"
              className={actionButtonClassName}
              onClick={() => {
                resetTimer();
                submitTest();
              }}
            />
          </>
        ) : (
          <>
            {allowMoreQuestionGeneration && (
              <Button
                title="New test"
                onClick={handleNewTest}
                size="large"
                variant="outlined"
              />
            )}
            <Button
              className={actionButtonClassName}
              title="Done"
              onClick={handleDone}
              size="large"
            />
          </>
        )}
      </ActionBar>
    </>
  );
};

export default MultipleTrueFalseCardContainer;
