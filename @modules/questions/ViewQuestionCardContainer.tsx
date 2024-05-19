import Container from "@/@shared/ui/Container";
import { QuestionSummaryModel } from "@/models/questions.model";
import React, { FC } from "react";
import ViewQuestionCard from "./ViewQuestionCard";

interface Props {
  data?: QuestionSummaryModel[];
}

const ViewQuestionCardContainer: FC<Props> = ({ data }) => {
  return (
    <Container>
      {data && data.length ? (
        <section className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-12 gap-10 mb-6">
          {data.map((d, idx) => (
            <ViewQuestionCard {...d} key={idx} />
          ))}
        </section>
      ) : (
        <div></div>
      )}
    </Container>
  );
};

export default ViewQuestionCardContainer;
