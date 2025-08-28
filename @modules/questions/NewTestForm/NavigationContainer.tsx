import { RootState } from "@/config/redux-config";
import {
  patchAdditionalSettings,
  resetNewTestForm,
  setCurrentStep,
  setSummaryView,
  Steps,
} from "@/features/newTestSlice";
import ChevronLeft from "@/icons/ChevronLeft";
import CloseIcon from "@/icons/CloseIcon";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

const NavigationContainer: FC = () => {
  const dispatch = useDispatch();
  const { currentStep, additionalSettings, isSummaryView } = useSelector(
    (state: RootState) => state.newTestSliceReducer
  );
  const handleStepNavigation = () => {
    const stepsArr = Steps.keys().toArray();
    const currentStepTitle = stepsArr[currentStep - 1];
    const previousStepIndex = stepsArr.indexOf(currentStepTitle) - 1;

    if (currentStep > 1 && currentStepTitle !== "ADDITIONAL_SETTINGS") {
      dispatch(setCurrentStep(stepsArr[previousStepIndex]));
    } else {
      if (
        additionalSettings.isBaseView &&
        currentStepTitle === "ADDITIONAL_SETTINGS"
      ) {
        dispatch(setCurrentStep(stepsArr[previousStepIndex]));
      } else {
        dispatch(
          patchAdditionalSettings({
            isBaseView: true,
          })
        );
      }
    }
  };
  return (
    <div className="flex items-center justify-between">
      <button
        className="min-h-[50px] min-w-[50px] -ml-2"
        onClick={() => {
          if (isSummaryView) {
            dispatch(setSummaryView(false));
          } else {
            handleStepNavigation();
          }
        }}
      >
        <ChevronLeft />
      </button>

      <button
        onClick={() => {
          dispatch(resetNewTestForm());
          // dispatch(setNewTestFormOpen(false));
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default NavigationContainer;
