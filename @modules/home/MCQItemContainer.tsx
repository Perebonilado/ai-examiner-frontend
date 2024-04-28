import Container from "@/@shared/ui/Container";
import { QuestionsModel } from "@/models/questions.model";
import React, { FC } from "react";
import MCQItem from "./MCQItem";
import Button from "@/@shared/ui/Button";

interface Props {
  data: QuestionsModel[];
}

const MCQItemContainer: FC<Props> = ({ data }) => {
  return (
    <section>
      <Container className="py-10">
        <div className="flex flex-col gap-6">
          {data.map((question, idx) => (
            <MCQItem {...question} key={question.id} questionNumber={idx + 1} />
          ))}
        </div>

        <div className="flex justify-end w-full max-w-[600px] mx-auto py-8">
          <Button title="Submit" size="large"/>
        </div>
      </Container>
    </section>
  );
};

export default MCQItemContainer;
