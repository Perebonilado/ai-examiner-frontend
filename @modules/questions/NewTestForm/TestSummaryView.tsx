import { RootState } from "@/config/redux-config";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import TestSummaryItem from "./TestSummaryItem";
import { testFormats } from "@/@modules/home/GenerateQuestionsForm";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import Button from "@/@shared/ui/Button";

interface Props {
  generateTest: () => void;
}

const TestSummaryView: FC<Props> = ({ generateTest }) => {
  const {
    selectedTestFormat,
    selectedTopics,
    totalQuestions,
    additionalSettings,
  } = useSelector((state: RootState) => state.newTestSliceReducer);

  return (
    <div>
      <h3 className="text-lg font-bold text-center">Ready to Generate ?</h3>
      <div className="py-6 flex flex-col gap-6">
        <TestSummaryItem
          title="Test Format"
          value={testFormats.find((f) => f.value === selectedTestFormat)!.title}
        />

        <TestSummaryItem
          title="Total questions"
          value={totalQuestions.toString()}
        />

        <TestSummaryItem
          title="Difficulty"
          value={capitalizeFirstLetterOfEachWord(additionalSettings.difficulty)}
        />

        <TestSummaryItem
          title="Select topics"
          value={`${selectedTopics.length} topic(s) selected`}
        />

        <TestSummaryItem
          title="Case studies"
          value={additionalSettings.isCaseStudies ? "Turned on" : "Turned off"}
        />
      </div>
      <div className="py-4">
        <Button
          title="Generate"
          className="mx-auto"
          size="large"
          onClick={generateTest}
        />
      </div>
    </div>
  );
};

export default TestSummaryView;
