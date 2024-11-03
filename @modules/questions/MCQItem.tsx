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
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import { useSaveProgressMutation } from "@/api-services/question-progress.service";
import SpeakerIcon from "@/icons/SpeakerIcon";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { SpeechButtonWithProgress } from "@/@shared/components/SpeechButtonWithProgress";
import QuestionExplanation from "./QuestionExplanation";

interface Props extends QuestionsModel {
  questionNumber: number;
  totalQuestionsCount: number;
  handleSetQuestionAnswer: (id: string, value: boolean) => void;
  submitted: boolean;
  isResetSelection: boolean;
  documentId: string;
  selectedOptionFromProgress: QuestionOption | null;
  speak: (text: string) => void;
  allowSaveProgress?: boolean;
  allowNotSure?: boolean;
}

const MCQItem: FC<Props> = ({
  explanation,
  id,
  options,
  question,
  questionNumber,
  correctAnswerId,
  submitted,
  documentId,
  totalQuestionsCount,
  selectedOptionFromProgress,
  handleSetQuestionAnswer,
  allowSaveProgress = true,
  allowNotSure = true,
}) => {
  const [questionId, setQuestionId] = useState("");

  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(
    null
  );

  useEffect(() => {
    if (selectedOptionFromProgress) {
      setSelectedOption(selectedOptionFromProgress);
    }
  }, [JSON.stringify(selectedOptionFromProgress)]);

  const [saveProgress, {}] = useSaveProgressMutation();

  const params = useParams();

  useEffect(() => {
    const id = params["id"] as string;
    if (id) {
      setQuestionId(id);
    }
  }, []);

  const correctAnswerMarkerStyling = cn(`font-bold pb-4`, {
    [`text-green-600`]: selectedOption?.id === correctAnswerId,
    [`text-rose-600`]: selectedOption?.id !== correctAnswerId,
  });

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
  };

  return (
    <div className="w-full bg-zinc-50 p-[50px] max-md:px-[20px] rounded-xl max-w-[800px] mx-auto border border-gray-200 max-sm:px-[15px]">
      {submitted && (
        <p className={correctAnswerMarkerStyling}>
          {selectedOption?.id === correctAnswerId ? "Correct!" : "Wrong"}
        </p>
      )}
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
          Option D: ${options[3].value}.
          `}
        />
      </div>
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

                if (allowSaveProgress) {
                  //save the progress

                  saveProgress({
                    id: questionId,
                    data: {
                      selectedOptionId: option.id,
                      selectedQuestionId: id,
                    },
                    status: "in_progress",
                    clearExistingProgress: false,
                  });
                }

                if (correctAnswerId === option.id) {
                  handleSetQuestionAnswer(id, true);
                } else {
                  handleSetQuestionAnswer(id, false);
                }
              }}
            />
          );
        })}
      </div>
      {!submitted &&
        (!permissions.canDiscuss
          ? allowNotSure && (
              <div className="mt-3 flex justify-center gap-2">
                <Button
                  title="Not Sure?"
                  className="hover:underline"
                  variant="text"
                  onClick={showSubscribeModalOnDiscussionUnavailable}
                />
              </div>
            )
          : allowNotSure && (
              <Link
                href={`/questions/view-questions/${documentId}?tab=Discussions&question=${question}`}
                passHref
                target="_blank"
              >
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    title="Not Sure?"
                    variant="text"
                    className="hover:underline"
                  />
                </div>
              </Link>
            ))}
      {submitted && (
        <div className="mt-3 flex flex-col gap-3 items-center">
          <QuestionExplanation explanation={explanation} />
          <Button title="View Source" size="medium" />
        </div>
      )}
    </div>
  );
};

export default MCQItem;
