import React, { FC, useState } from "react";
import MultipleTrueFalseItem from "./MultipleTrueFalseItem";
import { MultipleTrueFalseQuestionModel } from "@/models/questions.model";
import { useSaveProgressMutation } from "@/api-services/question-progress.service";
import { QuestionProgressModel } from "@/models/question-progress.model";
import QuestionExplanation from "./QuestionExplanation";
import {
  QuestionCard,
  QuestionCardTop,
  QuestionCount,
  QuestionText,
  Verdict,
} from "./TestUI";

interface Props extends MultipleTrueFalseQuestionModel {
  questionNumber: number;
  totalQuestionsCount: number;
  handleSetQuestionAnswer: ({
    id,
    selectedAnswer,
    questionIndex,
    correctAnswer,
  }: {
    id: string;
    selectedAnswer: boolean;
    questionIndex: number;
    correctAnswer: boolean;
  }) => void;
  submitted: boolean;
  allowSaveProgress: boolean;
  questionId: string;
  progress:
    | {
        selectedQuestionId: string;
        selectedOptionId: string;
        selectedAnswer?: boolean;
      }[]
    | null;
}

const MultipleTrueFalseCard: FC<Props> = ({
  explanation,
  id,
  options,
  question,
  handleSetQuestionAnswer,
  questionNumber,
  submitted,
  totalQuestionsCount,
  allowSaveProgress,
  questionId,
  progress,
}) => {
  const [saveProgress, {}] = useSaveProgressMutation();

  // Answers chosen in this session, so the card can show "3 of 4 correct" after submitting.
  const [liveAnswers, setLiveAnswers] = useState<Record<string, boolean>>({});

  const answerFor = (optionId: string): boolean | null => {
    if (optionId in liveAnswers) return liveAnswers[optionId];
    const fromProgress = progress?.find((p) => p.selectedOptionId === optionId);
    return fromProgress && typeof fromProgress.selectedAnswer === "boolean"
      ? fromProgress.selectedAnswer
      : null;
  };

  const correctCount = options.filter(
    (opt) => answerFor(opt.id) === opt.answer
  ).length;

  return (
    <QuestionCard>
      <QuestionCardTop
        left={
          submitted ? (
            <Verdict
              isRight={correctCount === options.length}
              label={`${correctCount} of ${options.length} correct`}
            />
          ) : (
            <QuestionCount
              number={questionNumber}
              total={totalQuestionsCount}
            />
          )
        }
        speakText={`
          ${question}

          Option A: ${options[0].value},
          Option B: ${options[1].value},
          Option C: ${options[2].value},
          Option D: ${options[3].value}.`}
      />

      <QuestionText>{question}</QuestionText>

      <div role="group" aria-label={`Statements for question ${questionNumber}`}>
        <div className="grid grid-cols-[minmax(0,1fr)_88px] max-md:grid-cols-[minmax(0,1fr)_86px] gap-x-3.5 max-md:gap-x-3 items-center h-[30px] border-b border-line text-xs font-semibold text-muted">
          <span>Statement</span>
          <span className="text-center whitespace-nowrap">True or False</span>
        </div>
        <div
          className={
            submitted
              ? "flex flex-col gap-2 pt-2.5"
              : "flex flex-col divide-y divide-line"
          }
        >
          {options.map((opt, idx) => {
            const selectedOptionInProgress =
              progress?.find((p) => p.selectedOptionId === opt.id) || null;
            const selectedAnswer =
              selectedOptionInProgress === null
                ? null
                : selectedOptionInProgress.selectedAnswer;
            return (
              <MultipleTrueFalseItem
                option={opt}
                submitted={submitted}
                selectedAnswerInProgress={selectedAnswer as boolean | null}
                key={idx}
                handleSetQuestionAnswer={(val) => {
                  setLiveAnswers((prev) => ({
                    ...prev,
                    [val.id]: val.selectedAnswer,
                  }));

                  handleSetQuestionAnswer({
                    ...val,
                    questionIndex: questionNumber - 1,
                  });

                  if (allowSaveProgress) {
                    saveProgress({
                      clearExistingProgress: false,
                      id: questionId,
                      status: "in_progress",
                      data: {
                        selectedOptionId: opt.id,
                        selectedQuestionId: id,
                        selectedAnswer: val.selectedAnswer,
                      },
                    });
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      {submitted && (
        <QuestionExplanation explanation={explanation} allowViewSource={false} />
      )}
    </QuestionCard>
  );
};

export default MultipleTrueFalseCard;
