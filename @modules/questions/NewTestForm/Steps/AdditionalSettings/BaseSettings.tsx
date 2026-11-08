import AdditionalSettingsBaseSetting from "@/@modules/home/AdditionalSettingsBaseSetting";
import { RootState } from "@/config/redux-config";
import {
  patchAdditionalSettings,
  setSummaryView,
} from "@/features/newTestSlice";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

const BaseSettings: FC = () => {
  const { additionalSettings, selectedTopics } = useSelector(
    (state: RootState) => state.newTestSliceReducer
  );
  const dispatch = useDispatch();
  const handleSelectDifficulty = () => {
    dispatch(
      patchAdditionalSettings({
        isDifficultyView: true,
        isBaseView: false,
      })
    );
  };

  const handleSelectTopics = () => {
    dispatch(
      patchAdditionalSettings({
        isDifficultyView: false,
        isBaseView: false,
      })
    );
  };

  const handleCaseStudies = () => {
    dispatch(
      patchAdditionalSettings({
        isCaseStudies: !additionalSettings.isCaseStudies,
      })
    );
  };

  return (
    <AdditionalSettingsBaseSetting
      canUseDifficulty={additionalSettings.permissions.canUseDifficulty}
      canUseCaseStudies={additionalSettings.permissions.canUseCaseStudies}
      difficulty={additionalSettings.difficulty}
      selectedTopics={selectedTopics}
      isCaseStudies={additionalSettings.isCaseStudies}
      handleCaseStudies={handleCaseStudies}
      handleSelectDifficulty={handleSelectDifficulty}
      handleSelectTopics={handleSelectTopics}
      handleClose={() => {
        dispatch(setSummaryView(true));
      }}
    />
  );
};

export default BaseSettings;
