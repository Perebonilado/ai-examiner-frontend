import Button from "@/@shared/ui/Button";
import React, { FC } from "react";
import { Info } from "lucide-react";
import { DialogFooter, DialogFrame, DialogHeader } from "./DialogFrame";
import QuestionCountGrid, { CountNote } from "./QuestionCountGrid";

interface Props {
  handleClose: () => void;
  handleSelected: (value: number) => void;
  selected: number;
  maxCount: number;
}

const TotalQuestionsContainer: FC<Props> = ({
  handleClose,
  handleSelected,
  selected,
  maxCount,
}) => {
  const options = [5, 10, 15, 20, 25, 30, 35, 40];
  return (
    <DialogFrame widthClass="max-w-[420px]" labelledBy="total-questions-title">
      <DialogHeader
        title="Total questions"
        titleId="total-questions-title"
        onClose={() => {
          handleClose();
        }}
      />

      <div className="px-5 pt-4 pb-5">
        <QuestionCountGrid
          options={options}
          selected={selected}
          maxCount={maxCount}
          onSelect={handleSelected}
          labelledBy="total-questions-title"
        />

        {maxCount < 40 && (
          <div className="mt-3.5">
            <CountNote icon={<Info />}>
              Your current plan is limited to{" "}
              <span className="font-semibold text-ink">{maxCount}</span>{" "}
              questions per test
            </CountNote>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button title="Continue" size="medium" onClick={handleClose} />
      </DialogFooter>
    </DialogFrame>
  );
};

export default TotalQuestionsContainer;
