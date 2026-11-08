import { testFormats } from "@/@modules/home/GenerateQuestionsForm";
import TestFormatItem from "@/@modules/home/TestFormatItem";
import Button from "@/@shared/ui/Button";
import { DialogFooter } from "@/@modules/home/DialogFrame";
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
      <h2
        id="new-test-format-title"
        className="px-5 pt-5 text-lg leading-[1.3] font-bold tracking-[-0.015em] text-ink"
      >
        Select test format
      </h2>
      <div
        role="radiogroup"
        aria-labelledby="new-test-format-title"
        className="flex flex-col gap-2 px-5 pt-4 pb-5"
      >
        {testFormats.map((tf, idx) => {
          return (
            <TestFormatItem
              {...tf}
              key={idx}
              handleSelect={(format) => {
                dispatch(selectTestFormat(format));

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

      <DialogFooter>
        <Button
          title="Continue"
          size="medium"
          onClick={() => {
            dispatch(setCurrentStep("TOTAL_QUESTIONS"));
          }}
        />
      </DialogFooter>
    </div>
  );
};

export default TestFormat;
