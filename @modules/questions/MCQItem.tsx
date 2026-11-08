import { QuestionOption, QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MCQOption from "./MCQOption";
import { useModalContext } from "@/contexts/ModalContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";
import { useParams } from "next/navigation";
import { useSaveProgressMutation } from "@/api-services/question-progress.service";
import QuestionExplanation from "./QuestionExplanation";
import ViewSourceDialog from "./ViewSource/ViewSourceDialog";
import {
  useQuestionSourceRequestMutation,
  useQuestionSourceRequestV2Mutation,
} from "@/api-services/questions.service";
import {
  setIsChatOpen,
  setNotSureMessage,
  setNotSureQuestion,
} from "@/features/documentChatSlice";
import { MessageCircleQuestion } from "lucide-react";
import {
  linkButtonClassName,
  QuestionCard,
  QuestionCardTop,
  QuestionCount,
  QuestionText,
  Verdict,
} from "./TestUI";

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
  allowViewSource?: boolean;
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
  allowViewSource = true,
}) => {
  const [questionId, setQuestionId] = useState("");

  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(
    null
  );

  const [source, setSource] = useState<string | null>(null);

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

  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  const { setModalContent } = useModalContext();

  // const [getQuestionSource, { data, isLoading, error }] =
  //   useQuestionSourceRequestMutation();

  const [getQuestionSource, { data, isLoading, error }] =
    useQuestionSourceRequestV2Mutation();

  useEffect(() => {
    if (data) {
      setSource(data.data);
      setModalContent(
        <ViewSourceDialog
          question={question}
          documentId={documentId}
          handleSourceText={(text) => {
            setSource(text);
          }}
          sourceText={`${data.data}`}
        />
      );
    }
  }, [data]);

  const showSubscribeModalOnDiscussionUnavailable = () => {
    setModalContent(
      <MaxGenerationModal
        title="Discussions only available on a paid plan!"
        body="Please, subscribe to a paid plan to continue"
      />
    );
  };

  const dispatch = useDispatch();

  const handleNotSure = () => {
    if (!permissions.canDiscuss) {
      showSubscribeModalOnDiscussionUnavailable();
      return;
    }
    dispatch(
      setNotSureQuestion({
        options: options.map((opt) => opt.value),
        question: question,
        questionType: "Multiple Choice",
      })
    );
    dispatch(setNotSureMessage(question));

    setTimeout(() => {
      dispatch(setIsChatOpen(true));
    }, 300);
  };

  const isAnswerSaved = allowSaveProgress && !!selectedOption;

  return (
    <QuestionCard>
      <QuestionCardTop
        left={
          submitted ? (
            <Verdict
              isRight={selectedOption?.id === correctAnswerId}
              label={selectedOption?.id === correctAnswerId ? "Correct!" : "Wrong"}
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
          Option D: ${options[3].value}.
          `}
      />
      <QuestionText>{question}</QuestionText>
      <div
        className="flex flex-col gap-2.5"
        role="group"
        aria-label={`Options for question ${questionNumber}`}
      >
        {options.map((opt, idx) => {
          return (
            <MCQOption
              option={opt}
              key={idx}
              letter={String.fromCharCode(65 + idx)}
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
      {!submitted && (allowNotSure || isAnswerSaved) && (
        <div className="mt-3.5 pt-3 border-t border-dashed border-line flex items-center justify-between gap-2 min-h-[45px]">
          {allowNotSure ? (
            <button
              type="button"
              className={linkButtonClassName}
              onClick={handleNotSure}
            >
              <MessageCircleQuestion size={16} strokeWidth={1.75} />
              Not sure?
            </button>
          ) : (
            <span />
          )}
          {isAnswerSaved && (
            <span className="text-xs text-muted">Answer saved</span>
          )}
        </div>
      )}
      {submitted && (
        <QuestionExplanation
          explanation={explanation}
          allowViewSource={allowNotSure}
          handleViewSource={() => {
            setModalContent(
              <ViewSourceDialog
                question={question}
                documentId={documentId}
                handleSourceText={(text) => {
                  setSource(text);
                }}
                sourceText={source}
              />
            );
          }}
        />
      )}
    </QuestionCard>
  );
};

export default MCQItem;
