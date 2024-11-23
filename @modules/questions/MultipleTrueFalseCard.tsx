import { SpeechButtonWithProgress } from "@/@shared/components/SpeechButtonWithProgress";
import React, { FC } from "react";
import MultipleTrueFalseItem from "./MultipleTrueFalseItem";
import { MultipleTrueFalseQuestionModel } from "@/models/questions.model";
import { useSaveProgressMutation } from "@/api-services/question-progress.service";
import { QuestionProgressModel } from "@/models/question-progress.model";
import QuestionExplanation from "./QuestionExplanation";

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

  return (
    <div className="w-full bg-zinc-50 p-[50px] max-md:px-[20px] rounded-xl max-w-[800px] mx-auto border border-gray-200 max-sm:px-[15px]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base text-[#939393]">
          {questionNumber} of {totalQuestionsCount}
        </p>
        <SpeechButtonWithProgress
          question={`
          ${question}

          Option A: ${options[0].value},
          Option B: ${options[1].value},
          Option C: ${options[2].value},
          Option D: ${options[3].value}.`}
        />
      </div>

      <p className="my-3 font-semibold text-base">{question}</p>

      <div className="py-4">
        <div className="text-sm font-semibold flex gap-2 p-4 py-2">
          <div className="w-[85%] max-sm:w-[70%]"></div>
          <div className="max-sm:w-[30%] w-[15%] flex justify-between gap-1">
            <span>True</span>
            <span>or</span>
            <span>False</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
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
        <div className="mt-3">
          <QuestionExplanation explanation={explanation} allowViewSource={false}/>
        </div>
      )}
    </div>
  );
};

export default MultipleTrueFalseCard;
