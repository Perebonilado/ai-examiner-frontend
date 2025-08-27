import React, { FC, useState } from "react";
import cn from "classnames";
import BaseSettings from "./BaseSettings";
import DifficultyMenuContainer from "@/@modules/home/DifficultyMenuContainer";
import TopicSelectionContainer from "@/@modules/home/TopicSelectionContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  patchAdditionalSettings,
  setDifficulty,
  setSelectedTopics,
} from "@/features/newTestSlice";
import { RootState } from "@/config/redux-config";

const AdditionalSettings: FC = () => {
  const { additionalSettings, topics, selectedTopics } = useSelector(
    (state: RootState) => state.newTestSliceReducer
  );
  const className = cn(
    `flex transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`,
    {
      ["-translate-x-[100%]"]: !additionalSettings.isBaseView,
    }
  );

  const dispatch = useDispatch();

  return (
    <div className="w-full overflow-hidden">
      <div className={className}>
        <BaseSettings />

        {additionalSettings.isDifficultyView ? (
          <DifficultyMenuContainer
            handleSelect={(value) => {
              dispatch(setDifficulty(value));
            }}
            handleBack={() => {
              dispatch(
                patchAdditionalSettings({
                  isBaseView: true,
                })
              );
            }}
            selectedDifficulty={additionalSettings.difficulty}
          />
        ) : (
          <TopicSelectionContainer
            topicsWithPages={topics}
            handleSave={(topics) => {
              dispatch(setSelectedTopics(topics));
              dispatch(patchAdditionalSettings({ isBaseView: true }));
            }}
            selectedTopics={selectedTopics}
          />
        )}
      </div>
    </div>
  );
};

export default AdditionalSettings;
