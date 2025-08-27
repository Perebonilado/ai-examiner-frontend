import Container from "@/@shared/ui/Container";
import { EssayQuestionPayload, QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
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
      <Container className="pb-10">
        <div className="flex flex-col gap-[80px]">
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
          <div className="flex justify-end gap-4 w-full max-w-[800px] mx-auto py-8">
            <div className="flex max-sm:w-full items-center justify-center gap-4 max-sm:flex-col-reverse">
              <Button
                title="New Test"
                onClick={() => {
                  if (handleGenerateMoreQuestions) {
                    handleGenerateMoreQuestions();
                  }
                }}
                size="large"
                variant="outlined"
                className="max-sm:w-full"
              />
              <Button
                title="Submit"
                size="large"
                className="max-sm:w-full"
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
                  submitTest(payload);
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EssayItemContainer;
