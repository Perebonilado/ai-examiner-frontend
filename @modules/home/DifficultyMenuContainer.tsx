import { difficultyOptions } from "@/constants";
import React, { FC } from "react";
import DifficultyMenuItem from "./DifficultyMenuItem";
import Button from "@/@shared/ui/Button";
import { DialogFooter, DialogHeader } from "./DialogFrame";

interface Props {
  handleSelect: (value: string) => void;
  selectedDifficulty: string;
  handleBack: () => void;
  /** Close button in the title row (standalone dialog). */
  onClose?: () => void;
  /** Back button in the title row (standalone dialog). */
  onBack?: () => void;
}

const DifficultyMenuContainer: FC<Props> = ({
  handleSelect,
  selectedDifficulty,
  handleBack,
  onClose,
  onBack,
}) => {
  return (
    <div className="min-w-full flex flex-col">
      <DialogHeader
        title="Choose your difficulty level"
        titleId="difficulty-title"
        onClose={onClose}
        onBack={onBack}
      />

      <div
        role="radiogroup"
        aria-labelledby="difficulty-title"
        className="grid grid-cols-3 gap-2.5 px-5 pt-4 pb-5"
      >
        {difficultyOptions.map((opt, idx) => {
          return (
            <DifficultyMenuItem
              key={idx}
              label={opt.label}
              value={opt.value}
              level={idx + 1}
              handleSelect={(value) => {
                handleSelect(value);
              }}
              selected={selectedDifficulty.toLowerCase() === opt.value}
            />
          );
        })}
      </div>

      <DialogFooter className="mt-auto">
        <Button title="Save" size="medium" onClick={handleBack} />
      </DialogFooter>
    </div>
  );
};

export default DifficultyMenuContainer;
