import useClickOutside from "@/hooks/useClickOutside";
import TransitionUp from "@/transitions/TransitionUp";
import React, { FC, useState } from "react";
import AdditionalSettingsBaseSetting from "./AdditionalSettingsBaseSetting";
import cn from "classnames";
import CloseIcon from "@/icons/CloseIcon";
import DifficultyMenuContainer from "./DifficultyMenuContainer";
import TopicSelectionContainer from "./TopicSelectionContainer";
import ChevronLeft from "@/icons/ChevronLeft";

interface Props {
  handleClose: () => void;
  selectedDifficulty: string;
  handleSelectDifficulty: (value: string) => void;
  allTopics: string[];
  selectedTopics: string[];
  handleSelectTopics: (topics: string[]) => void;
  isCaseStudy: boolean;
  handleCaseStudy: () => void;
  canUseCaseStudy: boolean;
  canUseDifficulty: boolean;
}

const AdditionalSettingsContainer: FC<Props> = ({
  handleClose,
  allTopics,
  canUseCaseStudy,
  handleCaseStudy,
  handleSelectDifficulty,
  handleSelectTopics,
  isCaseStudy,
  selectedDifficulty,
  selectedTopics,
  canUseDifficulty,
}) => {
  const [isBaseView, setIsBaseView] = useState(true);
  const [isDifficultyView, setIsDifficultyView] = useState(true);

  const className = cn(
    `flex transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`,
    {
      ["-translate-x-[100%]"]: !isBaseView,
    }
  );

  return (
    <TransitionUp className="w-full max-w-[450px] max-sm:max-w-[96vw] border rounded-3xl bg-white overflow-hidden">
      <div className="flex items-center justify-between my-4 mr-6">
        {isBaseView ? (
          <span className="min-h-[50px]"></span>
        ) : (
          <button
            className="min-h-[50px] ml-4 flex items-center gap-1 text-sm"
            onClick={() => {
              setIsBaseView(true);
            }}
          >
            <ChevronLeft />
            Back
          </button>
        )}
        <button
          onClick={() => {
            handleClose();
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div className={className}>
        <AdditionalSettingsBaseSetting
          handleClose={handleClose}
          isCaseStudies={isCaseStudy}
          canUseDifficulty={canUseDifficulty}
          difficulty={selectedDifficulty}
          selectedTopics={selectedTopics}
          canUseCaseStudies={canUseCaseStudy}
          handleCaseStudies={handleCaseStudy}
          handleSelectDifficulty={() => {
            setIsDifficultyView(true);
            setIsBaseView(false);
          }}
          handleSelectTopics={() => {
            setIsDifficultyView(false);
            setIsBaseView(false);
          }}
        />
        {isDifficultyView ? (
          <DifficultyMenuContainer
            handleSelect={(value) => {
              handleSelectDifficulty(value);
            }}
            handleBack={() => {
              setIsBaseView(true);
            }}
            selectedDifficulty={selectedDifficulty}
          />
        ) : (
          <TopicSelectionContainer
            topics={allTopics}
            handleSave={(topics) => {
              handleSelectTopics(topics);
              setIsBaseView(true);
            }}
            selectedTopics={selectedTopics}
          />
        )}
      </div>
    </TransitionUp>
  );
};

export default AdditionalSettingsContainer;
