import Container from "@/@shared/ui/Container";
import { QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MCQItem from "./MCQItem";
import Button from "@/@shared/ui/Button";

interface Props {
  data: QuestionsModel[];
}

const MCQItemContainer: FC<Props> = ({ data }) => {
  const [questionAnswerMap, setQuestionAnswerMap] = useState<Record<
    string,
    boolean
  > | null>(null);

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

  const generateScoreDescription = (percentage: number) => {
    switch (true) {
      case percentage > 90:
        return {
          image: "/90up.jpeg",
          message: "The emperor, the conqueror, the champion, the lion is here !!!",
        };
      case percentage >= 80 && percentage < 90:
        return {
          image: "/80-90.jpeg",
          message: "Clear road for who sabi !!!",
        };
      case percentage >= 70 && percentage < 80:
        return {
          image: "/70-80.jpeg",
          message: `Repeat after me, "I am doing well!"`,
        };
      case percentage >= 50 && percentage < 70:
        return {
          image: "/50-69.jpeg",
          message: "I no go gree for anybody !!!",
        };
      case percentage >= 30 && percentage < 50:
        return {
          image: "/30-49.jpeg",
          message: "Hmm, nobody knows tomorrow sha!",
        };
      default:
        return {
          image: "30 below.jpeg",
          message: "Eweeeee !",
        };
    }
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
            onClick={() => setIsSubmitted(true)}
          />
        </div>
      </Container>
    </section>
  );
};

export default MCQItemContainer;
