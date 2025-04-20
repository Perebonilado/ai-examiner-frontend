import Button from "@/@shared/ui/Button";
import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import CloseIcon from "@/icons/CloseIcon";
import TransitionUp from "@/transitions/TransitionUp";
import React, { FC } from "react";

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
  const midIndex = Math.ceil(options.length / 2);
  return (
    <TransitionUp className="w-full max-w-[420px] max-sm:max-w-[96vw]">
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => {
              handleClose();
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <h3 className="text-lg font-bold mb-6">Total questions</h3>

        <div className="mt-4 grid grid-cols-2">
          {[options.slice(0, midIndex), options.slice(midIndex)].map(
            (column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-5 text-gray-400">
                {column.map((value) => (
                  <Checkbox
                    key={value}
                    label={value.toString()}
                    value={value}
                    boldLabel={true}
                    customLabelColor={value > maxCount ? "#9ca3af" : "black"}
                    disabled={value > maxCount}
                    checked={selected === value}
                    onChange={() => {
                      handleSelected(value);
                    }}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {maxCount < 40 && (
          <p className="text-center text-xs mt-14">
            Your current plan is limited to{" "}
            <span className="font-semibold">{maxCount}</span> questions per test
          </p>
        )}
        <div className="mx-auto w-fit" style={{marginTop: maxCount < 40 ? '24px' : '48px'}}>
          <Button title="Continue" size="large" onClick={handleClose} />
        </div>
      </div>
    </TransitionUp>
  );
};

export default TotalQuestionsContainer;
