import { testFormats } from "@/@modules/home/GenerateQuestionsForm";
import Button from "@/@shared/ui/Button";
import { DialogFooter } from "@/@modules/home/DialogFrame";
import QuestionCountGrid, { CountNote } from "@/@modules/home/QuestionCountGrid";
import { Info, Mic } from "lucide-react";
import { RootState } from "@/config/redux-config";
import { setCurrentStep, setTotalQuestion } from "@/features/newTestSlice";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

const TotalQuestions: FC = () => {
  const options = [5, 10, 15, 20, 25, 30, 35, 40];
  const { maxQA: maxCount } = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );
  const { totalQuestions, selectedTestFormat } = useSelector(
    (state: RootState) => state.newTestSliceReducer
  );
  const dispatch = useDispatch();

  const isSelectedQuestionOralViva = () => {
    return (
      testFormats.find((f) => f.value === selectedTestFormat)!.title ===
      "Oral (viva)"
    );
  };

  const getMaxCount = () => {
    if (isSelectedQuestionOralViva()) {
      return 5;
    }

    return maxCount;
  };

  const showPlanNote = maxCount < 40;
  const showVivaNote = isSelectedQuestionOralViva();

  return (
    <div>
      <h2
        id="new-test-total-title"
        className="px-5 pt-5 text-lg leading-[1.3] font-bold tracking-[-0.015em] text-ink"
      >
        Total questions
      </h2>
      <div className="px-5 pt-4 pb-5">
        <QuestionCountGrid
          options={options}
          selected={totalQuestions}
          maxCount={getMaxCount()}
          onSelect={(value) => {
            dispatch(setTotalQuestion(value));
          }}
          labelledBy="new-test-total-title"
        />
        {(showPlanNote || showVivaNote) && (
          <div className="flex flex-col gap-1.5 mt-3.5">
            {showPlanNote && (
              <CountNote icon={<Info />}>
                Your current plan is limited to{" "}
                <span className="font-semibold text-ink">{maxCount}</span>{" "}
                questions per test
              </CountNote>
            )}
            {showVivaNote && (
              <CountNote icon={<Mic />}>
                Oral Viva test is limited to{" "}
                <span className="font-semibold text-ink">{getMaxCount()}</span>{" "}
                questions per test
              </CountNote>
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          title="Continue"
          size="medium"
          onClick={() => {
            dispatch(setCurrentStep("ADDITIONAL_SETTINGS"));
          }}
        />
      </DialogFooter>
    </div>
  );
};

export default TotalQuestions;
