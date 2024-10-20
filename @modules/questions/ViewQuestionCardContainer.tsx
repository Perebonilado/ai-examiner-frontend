import { QuestionSummaryModel } from "@/models/questions.model";
import React, { FC } from "react";
import ViewQuestionCard from "./ViewQuestionCard/ViewQuestionCard";

interface Props {
  data?: QuestionSummaryModel[];
}

const ViewQuestionCardContainer: FC<Props> = ({ data }) => {
  return (
    <>
      {data && data.length ? (
        <section className="flex items-start flex-wrap gap-y-12 gap-10 mb-6">
          {data.map((d, idx) => (
            <ViewQuestionCard {...d} index={idx} key={idx} />
          ))}
        </section>
      ) : null}
    </>
  );
};

export default ViewQuestionCardContainer;
