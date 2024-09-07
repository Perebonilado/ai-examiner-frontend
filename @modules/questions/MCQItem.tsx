import { QuestionOption, QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MCQOption from "./MCQOption";
import cn from "classnames";
import Button from "@/@shared/ui/Button";
import Link from "next/link";
import { useModalContext } from "@/contexts/ModalContext";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";

interface Props extends QuestionsModel {
  questionNumber: number;
  handleSetQuestionAnswer: (id: string, value: boolean) => void;
  submitted: boolean;
  isResetSelection: boolean;
  documentId: string;
}

const MCQItem: FC<Props> = ({
  explanation,
  id,
  options,
  question,
  questionNumber,
  correctAnswerId,
  submitted,
  isResetSelection,
  documentId,
  handleSetQuestionAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(
    null
  );

  const [isCorrect, setIsCorrect] = useState(false);

  const correctAnswerMarkerStyling = cn(`font-bold pb-4`, {
    [`text-green-600`]: isCorrect,
    [`text-rose-600`]: !isCorrect,
  });

  useEffect(() => {
    // reset it as long as this state changes
    setSelectedOption(null);
  }, [isResetSelection]);

  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  const { setModalContent } = useModalContext();

  const showSubscribeModalOnDiscussionUnavailable = () => {
    setModalContent(
      <MaxGenerationModal
        title="Discussions only available on a paid plan!"
        body="Please, subscribe to a paid plan to continue"
      />
    );
  }

  return (
    <div className="w-full bg-zinc-50 p-[50px] max-md:px-[20px] rounded-xl max-w-[800px] mx-auto border border-gray-200 ">
      {submitted && (
        <p className={correctAnswerMarkerStyling}>
          {isCorrect ? "Correct!" : "Wrong"}
        </p>
      )}
      <p className="text-lg text-[#360B58]">Question {questionNumber}</p>
      <p className="my-8 font-semibold text-lg">{question}</p>
      <div className="py-4 flex flex-col gap-6">
        {options.map((opt, idx) => {
          return (
            <MCQOption
              option={opt}
              key={idx}
              isChecked={!selectedOption ? false : selectedOption.id === opt.id}
              submitted={submitted}
              isRightOption={correctAnswerId === opt.id}
              handleChecked={(option) => {
                setSelectedOption(option);

                if (correctAnswerId === option.id) {
                  handleSetQuestionAnswer(id, true);
                  setIsCorrect(true);
                } else {
                  handleSetQuestionAnswer(id, false);
                  setIsCorrect(false);
                }
              }}
            />
          );
        })}
      </div>
      {!submitted &&
        (!permissions.canDiscuss ? (
          <div className="mt-3 flex justify-center gap-2">
            <Button
              title="Not Sure?"
              className="hover:underline"
              variant="text"
              onClick={showSubscribeModalOnDiscussionUnavailable}
            />
          </div>
        ) : (
          <Link
            href={`/questions/view-questions/${documentId}?tab=Discussions&question=${question}`}
            passHref
            target="_blank"
          >
            <div className="mt-3 flex justify-center gap-2">
              <Button title="Not Sure?" variant="text" className="hover:underline"/>
            </div>
          </Link>
        ))}
      {submitted && (
        <p className="text-sm font-semibold text-blue-600">
          Explanation: {explanation}
        </p>
      )}
    </div>
  );
};

export default MCQItem;
