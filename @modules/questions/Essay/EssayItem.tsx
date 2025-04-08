import { QuestionsModel } from "@/models/questions.model";
import React, { FC } from "react";
import EssayQuestion from "./EssayQuestion";
import { QuestionAnswer } from "./EssayItemContainer";
import { SpeechButtonWithProgress } from "@/@shared/components/SpeechButtonWithProgress";

interface Props extends QuestionsModel {
  questionNumber: number;
  totalQuestionsCount: number;
  documentId: string;
  speak: (text: string) => void;
  handleSetAnswer: ({ id, answer }: { id: string; answer: string }) => void;
}

const EssayItem: FC<Props> = ({
  id,
  question,
  questionNumber,
  totalQuestionsCount,
  handleSetAnswer,
}) => {
  return (
    <div className="w-full bg-zinc-50 p-[50px] max-md:px-[20px] rounded-xl max-w-[800px] mx-auto border border-gray-200 max-sm:px-[15px]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base text-[#939393]">
          {questionNumber} of {totalQuestionsCount}
        </p>
        <SpeechButtonWithProgress question={question}/>
      </div>
      <p className="my-8">
        <EssayQuestion question={question} />
      </p>
      <div>
        <textarea
          rows={10}
          onChange={(e) => {
            const value = e.target.value;
            if (value.trim()) {
              handleSetAnswer({ id, answer: value });
            }
          }}
          className="border outline-none border-[#CECECE] rounded-lg p-4 resize-none w-full transition-all duration-300 focus:outline-none focus:border-[#D8BFF0]"
        ></textarea>
      </div>
    </div>
  );
};

export default EssayItem;
