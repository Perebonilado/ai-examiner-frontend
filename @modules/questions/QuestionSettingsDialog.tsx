import Switch from "@/@shared/components/Switch";
import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import { useModalContext } from "@/contexts/ModalContext";
import { Timer, X } from "lucide-react";
import React, { FC, useState } from "react";

interface Props {
  numberOfQuestions: number;
  maxTimeForEachQuestionInSeconds: number;
  handleBeginTest: (selectedTime: number, isNegativeMarking: boolean) => void;
}

const QuestionSettingsDialog: FC<Props> = ({
  handleBeginTest,
  maxTimeForEachQuestionInSeconds,
  numberOfQuestions,
}) => {
  const { setModalContent } = useModalContext();

  const calculateRecommendedTimes = () => {
    const timeForAllQuestions =
      maxTimeForEachQuestionInSeconds * numberOfQuestions;
    const extraTimeAdditionsInSeconds = 60;
    const maxExtraTimes = 10;
    const options: {
      label: string;
      value: string;
      defaultSelected?: boolean;
    }[] = [];

    for (let i = 0; i < maxExtraTimes; i++) {
      if (i === 0) {
        const minuteValue = `${Math.floor(timeForAllQuestions / 60)} mins`;
        const value = Math.floor(timeForAllQuestions / 60) * 60;
        const option = {
          label: minuteValue,
          value: value.toString(),
          defaultSelected: true,
        };

        options.push(option);
      } else {
        const previousOption = options[i - 1];
        const addedTime =
          Number(previousOption.value) + extraTimeAdditionsInSeconds;
        const value = Math.floor(addedTime / 60) * 60;
        const minuteValue = `${Math.floor(addedTime / 60)} mins`;

        const option = {
          label: minuteValue,
          value: value.toString(),
        };

        options.push(option);
      }
    }

    return options;
  };

  const [selectedTime, setSelectedTime] = useState(
    Number(calculateRecommendedTimes()[0].value)
  );

  const [isNegativeMarking, setIsNegativeMarking] = useState(false);

  return (
    <div
      role="dialog"
      aria-labelledby="test-options-title"
      className="w-full relative max-w-[400px] max-md:max-w-[92vw] rounded-2xl shadow-pop border border-edge bg-surface"
    >
      <div className="flex items-start gap-3 px-5 pt-5">
        <h2
          id="test-options-title"
          className="flex-1 text-lg font-bold text-ink tracking-[-0.015em]"
        >
          Options
        </h2>
        <button
          type="button"
          aria-label="Close"
          className="-mt-1.5 -mr-1.5 w-9 h-9 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className="px-5 pt-[18px] pb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h5 id="negative-marking-label" className="text-sm font-semibold text-ink">
              Negative marking
            </h5>
            <p className="mt-1 text-[13px] leading-[1.45] text-muted max-w-[34ch]">
              Turning this on will deduct marks for wrong answers.
            </p>
          </div>
          <div className="shrink-0">
            <Switch
              handleChecked={() => {
                setIsNegativeMarking(!isNegativeMarking);
              }}
              isChecked={isNegativeMarking}
              disabled={false}
            />
          </div>
        </div>

        <hr className="my-4 h-px border-0 bg-line" />

        <div className="flex items-center justify-between gap-4">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Timer size={16} strokeWidth={1.75} className="text-muted" />
            Timer
          </h5>
          <div className="w-[120px] -mt-1.5 tabular-nums">
            <DropDown
              aria-label="Timer"
              options={[...calculateRecommendedTimes()]}
              openFromTop={true}
              onChange={(e) => {
                setSelectedTime(Number(e.target.value));
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-line bg-canvas rounded-b-2xl">
        <Button
          title="Begin test"
          size="medium"
          fullWidth
          onClick={() => {
            handleBeginTest(selectedTime, isNegativeMarking);
          }}
        />
      </div>
    </div>
  );
};

export default QuestionSettingsDialog;
