import Container from "@/@shared/ui/Container";
import { QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MCQItem from "./MCQItem";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import SubmissionModal from "./SubmissionModal";

interface Props {
  data: QuestionsModel[];
}

const MCQItemContainer: FC<Props> = ({ data }) => {
  const [questionAnswerMap, setQuestionAnswerMap] = useState<Record<
    string,
    boolean
  > | null>(null);

  const { setModalContent } = useModalContext();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSetQuestionAnswerMap = () => {
    const map: Record<string, boolean> = {};

    for (const item of data) {
      map[`${item.id}`] = false;
    }

    setQuestionAnswerMap(map);
  };

  useEffect(() => {
    handleSetQuestionAnswerMap();
  }, [data]);

  const handleSetQuestionAnswerMapItem = (id: string, value: boolean) => {
    const newMap = { ...questionAnswerMap };
    newMap[id] = value;
    setQuestionAnswerMap(newMap);
  };

  const calculateScorePercentage = () => {
    if (questionAnswerMap) {
      const answersArr = Object.values(questionAnswerMap);

      const totalQuestions = answersArr.length;

      const totalCorrectAnswers = answersArr.filter((ans) => ans).length;

      const scorePercentage = (totalCorrectAnswers / totalQuestions) * 100;

      return scorePercentage;
    }

    return 0;
  };

  return (
    <section>
      <Container className="py-10">
        <div className="flex flex-col gap-6">
          {data.map((question, idx) => (
            <MCQItem
              {...question}
              key={question.id}
              questionNumber={idx + 1}
              handleSetQuestionAnswer={handleSetQuestionAnswerMapItem}
              submitted={isSubmitted}
            />
          ))}
        </div>

        <div className="flex justify-end w-full max-w-[600px] mx-auto py-8">
          <Button
            title="Submit"
            size="large"
            onClick={() => {
              setIsSubmitted(true);
              setModalContent(
                <SubmissionModal scorePercentage={calculateScorePercentage()} />
              );
            }}
          />
        </div>
      </Container>
    </section>
  );
};

export default MCQItemContainer;
