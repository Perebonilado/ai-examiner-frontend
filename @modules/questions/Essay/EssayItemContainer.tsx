import { EssayQuestionPayload, QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useRef, useState } from "react";
import { stopwatch, track } from "@/@shared/analytics/track";
import EssayItem from "./EssayItem";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import Button from "@/@shared/ui/Button";

export interface QuestionAnswer {
  specificQuestionId: string;
  question: string;
  answer: string;
}

interface Props {
  data: QuestionsModel[];
  documentId: string;
  questionId: string;
  handleGenerateMoreQuestions?: () => void;
  submitTest: (payload: EssayQuestionPayload) => void;
}

const EssayItemContainer: FC<Props> = ({
  data,
  documentId,
  handleGenerateMoreQuestions,
  questionId,
  submitTest
}) => {
  const { speak } = useSpeechToText();
  const [questionAnswer, setQuestionAnswer] = useState<QuestionAnswer[]>([]);
  const took = useRef(stopwatch());
  useEffect(() => {
    if (!questionId) return;
    took.current = stopwatch();
    track("test_opened", { type: "essay", testId: questionId });
  }, [questionId]);

  useEffect(() => {
    if (data) {
      setQuestionAnswer(
        data.map((d) => {
          return { specificQuestionId: d.id, question: d.question, answer: "" };
        })
      );
    }
  }, [data]);

  return (
    <div>
      <div className="flex flex-col gap-7">
        {data.map((d, idx) => {
          return (
            <EssayItem
              {...d}
              questionNumber={idx + 1}
              totalQuestionsCount={data.length}
              documentId={documentId}
              speak={speak}
              handleSetAnswer={({ answer, id }) => {
                const mapped = questionAnswer.map((qa) => {
                  if (qa.specificQuestionId === id) {
                    return { ...qa, answer: answer };
                  }

                  return qa;
                });

                setQuestionAnswer(mapped);
              }}
              key={idx}
            />
          );
        })}
      </div>
      <div data-phone-bottom-bar="" className="flex justify-end gap-2.5 mt-8 max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:mt-6 max-md:px-4 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom))] max-md:border-t max-md:border-line max-md:bg-surface-glass max-md:backdrop-blur-md">
        <Button
          title="New test"
          onClick={() => {
            if (handleGenerateMoreQuestions) {
              handleGenerateMoreQuestions();
            }
          }}
          size="large"
          variant="outlined"
          className="max-md:flex-1"
        />
        <Button
          title="Submit"
          size="large"
          className="min-w-[160px] max-md:min-w-0 max-md:flex-1"
          onClick={() => {
            const data = questionAnswer.map((qa) => {
              {
                return {
                  question: qa.question,
                  answer: qa.answer,
                };
              }
            });

            const payload = {
              questionId,
              data,
            };
            const written = questionAnswer.filter((qa) => (qa.answer ?? "").trim()).length;
            track(
              "test_submitted",
              { type: "essay", testId: questionId, answered: written, total: questionAnswer.length, blank: written === 0 },
              took.current()
            );
            submitTest(payload);
          }}
        />
      </div>
    </div>
  );
};

export default EssayItemContainer;
