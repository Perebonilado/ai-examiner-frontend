import Container from "@/@shared/ui/Container";
import { QuestionSummaryModel } from "@/models/questions.model";
import React, { FC } from "react";
import ViewQuestionCard from "./ViewQuestionCard";

interface Props {
  data?: QuestionSummaryModel[];
}

const ViewQuestionCardContainer: FC<Props> = ({ data }) => {
  return (
    <>
      {data && data.length ? (
        <section className="flex justify-center items-center flex-wrap gap-y-12 gap-10 mb-6">
          {data.map((d, idx) => (
            <ViewQuestionCard {...d} key={idx} />
          ))}
        </section>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default ViewQuestionCardContainer;
