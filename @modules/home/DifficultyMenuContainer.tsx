import { difficultyOptions } from "@/constants";
import React, { FC } from "react";
import DifficultyMenuItem from "./DifficultyMenuItem";
import Button from "@/@shared/ui/Button";

interface Props {
  handleSelect: (value: string) => void;
  selectedDifficulty: string;
  handleBack: () => void;
}

const DifficultyMenuContainer: FC<Props> = ({
  handleSelect,
  selectedDifficulty,
  handleBack
}) => {
  return (
    <div className="bg-white p-6 pt-0 rounded-2xl min-w-full">
      <h3 className="text-lg font-bold mb-6">Choose your difficulty level</h3>

      <div className="mt-4 flex flex-col gap-5">
        {difficultyOptions.map((opt, idx) => {
          return (
            <DifficultyMenuItem
              key={idx}
              label={opt.label}
              value={opt.value}
              handleSelect={(value) => {
                handleSelect(value);
              }}
              selected={selectedDifficulty.toLowerCase() === opt.value}
            />
          );
        })}

        <Button title="Save" size="large" onClick={handleBack} className="block mx-auto mt-2"/>
      </div>
    </div>
  );
};

export default DifficultyMenuContainer;
