import { testFormats } from "@/@modules/home/GenerateQuestionsForm";
import Button from "@/@shared/ui/Button";
import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import { RootState } from "@/config/redux-config";
import { setCurrentStep, setTotalQuestion } from "@/features/newTestSlice";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

const TotalQuestions: FC = () => {
  const options = [5, 10, 15, 20, 25, 30, 35, 40];
  const midIndex = Math.ceil(options.length / 2);
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

  return (
    <div>
      <h3 className="text-lg font-bold mb-6">Total questions</h3>
      <div className="mt-4 grid grid-cols-2">
        {[options.slice(0, midIndex), options.slice(midIndex)].map(
          (column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-5 text-gray-400">
              {column.map((value) => (
                <Checkbox
                  key={value}
                  label={value.toString()}
                  value={value}
                  boldLabel={true}
                  customLabelColor={value > getMaxCount() ? "#9ca3af" : "black"}
                  disabled={value > getMaxCount()}
                  checked={totalQuestions === value}
                  onChange={() => {
                    dispatch(setTotalQuestion(value));
                  }}
                />
              ))}
            </div>
          )
        )}
      </div>
      <div className="flex flex-col gap-2 mt-14">
        {maxCount < 40 && (
          <p className="text-center text-xs">
            Your current plan is limited to{" "}
            <span className="font-semibold">{maxCount}</span> questions per test
          </p>
        )}
        {isSelectedQuestionOralViva() && (
          <p className="text-center text-xs">
            Oral Viva test is limited to{" "}
            <span className="font-semibold">{getMaxCount()}</span> questions per
            test
          </p>
        )}
      </div>
      <div
        className="mx-auto w-fit"
        style={{ marginTop: maxCount < 40 ? "24px" : "48px" }}
      >
        <Button
          title="Continue"
          size="large"
          onClick={() => {
            dispatch(setCurrentStep("ADDITIONAL_SETTINGS"));
          }}
        />
      </div>
    </div>
  );
};

export default TotalQuestions;
