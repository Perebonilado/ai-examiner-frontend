import React, { FC } from "react";
import AdditionalSettingsItem from "./AdditionalSettingsItem";
import TextField from "@/@shared/ui/Input/TextField";
import Switch from "@/@shared/components/Switch";
import Button from "@/@shared/ui/Button";
import ChevronRight from "@/icons/ChevronRight";

interface Props {
  handleSelectDifficulty: () => void;
  handleSelectTopics: () => void;
  isCaseStudies: boolean;
  handleCaseStudies: () => void;
  canUseCaseStudies: boolean;
  canUseDifficulty: boolean;
  difficulty: string;
  selectedTopics: string[];
  handleClose: () => void;
}

const AdditionalSettingsBaseSetting: FC<Props> = ({
  handleSelectDifficulty,
  handleSelectTopics,
  isCaseStudies,
  handleCaseStudies,
  canUseCaseStudies,
  difficulty,
  selectedTopics,
  canUseDifficulty,
  handleClose,
}) => {
  return (
    <div className="bg-white p-6 pt-0 rounded-2xl min-w-full">
      <h3 className="text-lg font-bold mb-6">Test settings</h3>

      <div className="mt-4 flex flex-col gap-12">
        {canUseDifficulty && (
          <AdditionalSettingsItem
            title="Difficulty level"
            description="Control how challenging your questions will be"
            handleClick={handleSelectDifficulty}
          >
            <div className="w-full max-w-[120px] flex items-center justify-end">
              <button onClick={handleSelectDifficulty}>
                <ChevronRight />
              </button>
              {/* <TextField
                onClick={handleSelectDifficulty}
                value={difficulty}
                cursorPointer
              /> */}
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
            {/* <TextField
              onClick={handleSelectTopics}
              value={selectedTopics.join(", ")}
              cursorPointer
            /> */}
          </div>
        </AdditionalSettingsItem>

        {canUseCaseStudies && (
          <AdditionalSettingsItem
            title="Case studies"
            description="Turn on to unlock real-world case scenarios tailored to your learning."
            handleClick={handleCaseStudies}
          >
            <Switch
              isChecked={isCaseStudies}
              handleChecked={handleCaseStudies}
              disabled={false}
            />
          </AdditionalSettingsItem>
        )}

        <div className="w-fit mx-auto">
          <Button title="Save" size="large" onClick={handleClose} />
        </div>
      </div>
    </div>
  );
};

export default AdditionalSettingsBaseSetting;
