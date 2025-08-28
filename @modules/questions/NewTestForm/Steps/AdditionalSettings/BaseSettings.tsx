import AdditionalSettingsItem from "@/@modules/home/AdditionalSettingsItem";
import Switch from "@/@shared/components/Switch";
import Button from "@/@shared/ui/Button";
import { RootState } from "@/config/redux-config";
import {
  patchAdditionalSettings,
  setSummaryView,
} from "@/features/newTestSlice";
import ChevronRight from "@/icons/ChevronRight";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

const BaseSettings: FC = () => {
  const { additionalSettings } = useSelector(
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
    <div className="min-w-full">
      <h3 className="text-base font-bold mb-6">Test settings</h3>
      <div className="mt-4 flex flex-col gap-12">
        {additionalSettings.permissions.canUseDifficulty && (
          <AdditionalSettingsItem
            title="Difficulty level"
            description="Control how challenging your questions will be"
            handleClick={handleSelectDifficulty}
          >
            <div className="w-full max-w-[120px] flex items-center justify-end">
              <button onClick={handleSelectDifficulty}>
                <ChevronRight />
              </button>
            </div>
          </AdditionalSettingsItem>
        )}

        <AdditionalSettingsItem
          title="Select topics"
          description="Automatically suggests key topics from your uploaded material"
          handleClick={handleSelectTopics}
        >
          <div className="w-full max-w-[120px] flex items-center justify-end">
            <button onClick={handleSelectTopics}>
              <ChevronRight />
            </button>
          </div>
        </AdditionalSettingsItem>

        {additionalSettings.permissions.canUseCaseStudies && (
          <AdditionalSettingsItem
            title="Case studies"
            description="Turn on to unlock real-world case scenarios tailored to your learning."
            handleClick={handleCaseStudies}
          >
            <Switch
              isChecked={additionalSettings.isCaseStudies}
              handleChecked={handleCaseStudies}
              disabled={false}
            />
          </AdditionalSettingsItem>
        )}

        <div className="w-fit mx-auto">
          <Button
            title="Save"
            size="large"
            onClick={() => {
              dispatch(setSummaryView(true));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BaseSettings;
