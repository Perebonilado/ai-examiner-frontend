import { testFormats } from "@/@modules/home/GenerateQuestionsForm";
import TestFormatItem from "@/@modules/home/TestFormatItem";
import Button from "@/@shared/ui/Button";
import { RootState } from "@/config/redux-config";
import {
  patchAdditionalSettings,
  selectTestFormat,
  setCurrentStep,
  testFormatsMap,
} from "@/features/newTestSlice";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

const TestFormat: FC = () => {
  const dispatch = useDispatch();
  const { selectedTestFormat, additionalSettings } = useSelector(
    (state: RootState) => state.newTestSliceReducer
  );
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold">Select test format</h3>
      </div>
      <div className="mt-4 flex flex-col gap-6 max-h-[320px] overflow-y-auto">
        {testFormats.map((tf, idx) => {
          return (
            <TestFormatItem
              {...tf}
              key={idx}
              handleSelect={(format) => {
                dispatch(selectTestFormat(format));

                // addon permissions
                const allowCaseStudies = [
                  testFormatsMap.get("Multiple Choice")!.value,
                  testFormatsMap.get("Essay")!.value,
                ].includes(format);
                const allowDifficultySelection =
                  format !== testFormatsMap.get("Oral (viva)")!.value;
                dispatch(
                  patchAdditionalSettings({
                    permissions: {
                      ...additionalSettings.permissions,
                      canUseCaseStudies: allowCaseStudies,
                      canUseDifficulty: allowDifficultySelection,
                    },
                  })
                );
              }}
              selected={tf.value === selectedTestFormat}
            />
          );
        })}
      </div>

      <Button
        title="Continue"
        className="mt-8 mx-auto"
        onClick={() => {
          dispatch(setCurrentStep("TOTAL_QUESTIONS"));
        }}
      />
    </div>
  );
};

export default TestFormat;
