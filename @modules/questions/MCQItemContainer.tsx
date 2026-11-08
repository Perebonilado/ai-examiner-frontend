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
import { ActionBar, actionButtonClassName, ResultRow } from "./TestUI";

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
  /** Restart (clear progress); shown in the result row after submitting. */
  handleRestart?: () => void;
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
  handleRestart,
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
  const [
    submitProgress,
    { isLoading: progressSubmitting, data: progressSubmitted, isError: progressSubmittingError },
  ] = useSaveProgressMutation();

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
          maxTimeForEachQuestionInSeconds={60}
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

  const answeredCount = questionAnswerMap
    ? Object.keys(questionAnswerMap).length
    : 0;
  const correctCount = questionAnswerMap
    ? Object.values(questionAnswerMap).filter((ans) => ans).length
    : 0;

  const handleNewTest = () => {
    if (handleGenerateMoreQuestions) {
      handleGenerateMoreQuestions();
    }
  };

  return (
    <section>
      {!isSubmitted && (
        <CountdownTimer
          timeLeft={timeLeftSeconds && totalDuration ? timeLeftSeconds : null}
          totalDuration={totalDuration}
          answered={answeredCount}
          total={data.length}
        />
      )}

      {isSubmitted && (
        <ResultRow
          percentage={calculateScorePercentage()}
          correct={correctCount}
          total={data.length}
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

      <div className="flex flex-col gap-7">
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

      <ActionBar>
        {!isSubmitted ? (
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
    </section>
  );
};

export default MCQItemContainer;
