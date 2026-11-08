import React, { FC, useState } from "react";
import AdditionalSettingsBaseSetting from "./AdditionalSettingsBaseSetting";
import cn from "classnames";
import DifficultyMenuContainer from "./DifficultyMenuContainer";
import TopicSelectionContainer from "./TopicSelectionContainer";
import { TopicsV2Model } from "@/models/file-upload.model";
import { DialogFrame } from "./DialogFrame";

interface Props {
  handleClose: () => void;
  selectedDifficulty: string;
  handleSelectDifficulty: (value: string) => void;
  allTopics: string[];
  topicsWithPages: TopicsV2Model[];
  selectedTopics: TopicsV2Model[];
  handleSelectTopics: (topics: TopicsV2Model[]) => void;
  isCaseStudy: boolean;
  handleCaseStudy: () => void;
  canUseCaseStudy: boolean;
  canUseDifficulty: boolean;
}

const AdditionalSettingsContainer: FC<Props> = ({
  handleClose,
  allTopics,
  topicsWithPages,
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
    `flex items-start transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none`,
    {
      ["-translate-x-[100%]"]: !isBaseView,
    }
  );

  /* The off-screen panel collapses so the dialog takes the height of the visible one. */
  const panel = (visible: boolean) =>
    cn("min-w-full", { "h-0 overflow-hidden": !visible });

  return (
    <DialogFrame
      widthClass="max-w-[480px]"
      labelledBy={
        isBaseView
          ? "test-settings-title"
          : isDifficultyView
          ? "difficulty-title"
          : "topics-title"
      }
    >
      <div className="overflow-hidden">
        <div className={className}>
          <div className={panel(isBaseView)} aria-hidden={!isBaseView}>
            <AdditionalSettingsBaseSetting
              handleClose={handleClose}
              onDismiss={handleClose}
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
          </div>
          <div className={panel(!isBaseView)} aria-hidden={isBaseView}>
            {isDifficultyView ? (
              <DifficultyMenuContainer
                handleSelect={(value) => {
                  handleSelectDifficulty(value);
                }}
                handleBack={() => {
                  setIsBaseView(true);
                }}
                onBack={() => {
                  setIsBaseView(true);
                }}
                onClose={handleClose}
                selectedDifficulty={selectedDifficulty}
              />
            ) : (
              <TopicSelectionContainer
                topics={allTopics}
                topicsWithPages={topicsWithPages}
                handleSave={(topics) => {
                  handleSelectTopics(topics);
                  setIsBaseView(true);
                }}
                onBack={() => {
                  setIsBaseView(true);
                }}
                onClose={handleClose}
                selectedTopics={selectedTopics}
              />
            )}
          </div>
        </div>
      </div>
    </DialogFrame>
  );
};

export default AdditionalSettingsContainer;
