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

interface Props {
  data: MultipleTrueFalseQuestionModel[];
  submitted: boolean;
  title: string;
  handleSubmitted: () => void;
  handleDone: () => void;
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
  handleDone,
  documentId,
}) => {
  const [questionAnswerMap, setQuestionAnswerMap] =
    useState<QuestionAnswerMap | null>(null);

  const [submitProgress, {}] = useSaveProgressMutation();

  const { setModalContent } = useModalContext();

  const [questionId, setQuestionId] = useState("");

  const params = useParams();

  const { data: progress } = useGetProgressQuery(
    { id: questionId },
    { skip: !questionId || !allowSaveProgress, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (params.id) setQuestionId(params.id as string);
  }, [params]);

  const calculateScorePercentage = () => {
    if (questionAnswerMap) {
      const scoreValues = Object.values(questionAnswerMap);
      const totalScoreForEachQuestion = scoreValues.map((score) => {
        let totalScore = 0;
        for (const key in score) {
          if (score[key].isCorrect) {
            totalScore += 1;
          }
        }

        return totalScore;
      });

      const totalScoreForAllQuestions = totalScoreForEachQuestion.reduce(
        (a, b) => a + b,
        0
      );

      const weightOfEachQuestion = 4
      const totalQuestions = data.length * weightOfEachQuestion;

      return (totalScoreForAllQuestions / totalQuestions) * 100;
    }

    return 0;
  };

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
      setModalContent(
        <SubmissionModal
          title={title}
          scorePercentage={calculateScorePercentage()}
        />
      );
    }
  }, [isSuccess, isLoading]);

  useEffect(() => {
    if (progress && progress.status === "submitted") {
      handleSubmitted();
    }
  }, [progress]);

  return (
    <section className="flex flex-col gap-12">
      {data.map((d, idx) => {
        const questionProgress =
          progress?.data?.filter((p) => p.selectedQuestionId === d.id) || null;
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
          <>
            <Button
              title="Submit"
              size="large"
              onClick={() => {
                handleSubmitted();

                if (allowSaveScore) {
                  saveScore({
                    documentId: documentId,
                    questionId,
                    score: calculateScorePercentage(),
                  });
                } else {
                  setModalContent(
                    <SubmissionModal
                      title={title}
                      scorePercentage={calculateScorePercentage()}
                    />
                  );
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
    </section>
  );
};

export default MultipleTrueFalseCardContainer;
