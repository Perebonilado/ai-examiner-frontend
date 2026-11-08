import { RootState } from "@/config/redux-config";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import TestSummaryItem from "./TestSummaryItem";
import { testFormats } from "@/@modules/home/GenerateQuestionsForm";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import Button from "@/@shared/ui/Button";
import { DialogFooter } from "@/@modules/home/DialogFrame";
import { Gauge, Hash, ListChecks, Stethoscope, Tags } from "lucide-react";
import cn from "classnames";

interface Props {
  generateTest: () => void;
}

const sentenceCase = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const TestSummaryView: FC<Props> = ({ generateTest }) => {
  const {
    selectedTestFormat,
    selectedTopics,
    selectedQuestionTopics,
    totalQuestions,
    additionalSettings,
  } = useSelector((state: RootState) => state.newTestSliceReducer);

  return (
    <div>
      <h2
        id="new-test-summary-title"
        className="px-5 pt-2 text-lg leading-[1.3] font-bold tracking-[-0.015em] text-ink"
      >
        Ready to generate?
      </h2>
      <dl className="px-5 pt-3 pb-3.5">
        <TestSummaryItem
          icon={<ListChecks strokeWidth={1.75} />}
          title="Test format"
          value={sentenceCase(
            testFormats.find((f) => f.value === selectedTestFormat)!.title
          )}
        />

        <TestSummaryItem
          icon={<Hash strokeWidth={1.75} />}
          title="Total questions"
          value={totalQuestions.toString()}
        />

        <TestSummaryItem
          icon={<Gauge strokeWidth={1.75} />}
          title="Difficulty"
          value={capitalizeFirstLetterOfEachWord(additionalSettings.difficulty)}
        />

        <TestSummaryItem
          icon={<Tags strokeWidth={1.75} />}
          title="Select topics"
          value={`${selectedTopics.length || selectedQuestionTopics.length} topic(s) selected`}
        />

        <TestSummaryItem
          icon={<Stethoscope strokeWidth={1.75} />}
          title="Case studies"
          value={
            <span
              className={cn(
                "inline-flex items-center h-[22px] px-2 rounded-full text-[11.5px] font-semibold",
                additionalSettings.isCaseStudies
                  ? "bg-success-bg text-success-strong"
                  : "bg-sunken text-subtle"
              )}
            >
              {additionalSettings.isCaseStudies ? "Turned on" : "Turned off"}
            </span>
          }
        />
      </dl>
      <DialogFooter>
        <Button title="Generate" size="medium" onClick={generateTest} />
      </DialogFooter>
    </div>
  );
};

export default TestSummaryView;
