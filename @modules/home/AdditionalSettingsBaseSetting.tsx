import React, { FC } from "react";
import AdditionalSettingsItem, {
  SettingsSeparator,
} from "./AdditionalSettingsItem";
import Switch from "@/@shared/components/Switch";
import Button from "@/@shared/ui/Button";
import { TopicsV2Model } from "@/models/file-upload.model";
import { DialogFooter, DialogHeader } from "./DialogFrame";
import { capitalizeFirstLetterOfEachWord } from "@/utils";

interface Props {
  handleSelectDifficulty: () => void;
  handleSelectTopics: () => void;
  isCaseStudies: boolean;
  handleCaseStudies: () => void;
  canUseCaseStudies: boolean;
  canUseDifficulty: boolean;
  difficulty: string;
  selectedTopics: TopicsV2Model[];
  handleClose: () => void;
  /** Shows the close button in the title row (standalone dialog). */
  onDismiss?: () => void;
  /** Hide the "Test settings" title row (when a parent dialog already shows a title). */
  hideTitle?: boolean;
  saveTitle?: string;
}

/* "Test settings": Difficulty level / Select topics / Case studies, then Save. */
const AdditionalSettingsBaseSetting: FC<Props> = ({
  handleSelectDifficulty,
  handleSelectTopics,
  isCaseStudies,
  handleCaseStudies,
  canUseCaseStudies,
  difficulty,
  canUseDifficulty,
  handleClose,
  onDismiss,
  hideTitle = false,
  saveTitle = "Save",
}) => {
  const rows = [
    canUseDifficulty && (
      <AdditionalSettingsItem
        key="difficulty"
        title="Difficulty level"
        description="Control how challenging your questions will be"
        value={difficulty ? capitalizeFirstLetterOfEachWord(difficulty) : ""}
        handleClick={handleSelectDifficulty}
      />
    ),
    <AdditionalSettingsItem
      key="topics"
      title="Select topics"
      description="Automatically suggests key topics from your uploaded material"
      handleClick={handleSelectTopics}
    />,
    canUseCaseStudies && (
      <AdditionalSettingsItem
        key="case-studies"
        variant="switch"
        title="Case studies"
        description="Turn on to unlock real-world case scenarios tailored to your learning."
        checked={isCaseStudies}
        handleClick={handleCaseStudies}
      >
        <Switch
          isChecked={isCaseStudies}
          handleChecked={handleCaseStudies}
          disabled={false}
        />
      </AdditionalSettingsItem>
    ),
  ].filter(Boolean);

  return (
    <div className="min-w-full flex flex-col">
      {!hideTitle && (
        <DialogHeader
          title="Test settings"
          titleId="test-settings-title"
          onClose={onDismiss}
        />
      )}
      <div className="px-1 pt-2.5 pb-3">
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && <SettingsSeparator />}
            {row}
          </React.Fragment>
        ))}
      </div>
      <DialogFooter className="mt-auto">
        <Button title={saveTitle} size="medium" onClick={handleClose} />
      </DialogFooter>
    </div>
  );
};

export default AdditionalSettingsBaseSetting;
