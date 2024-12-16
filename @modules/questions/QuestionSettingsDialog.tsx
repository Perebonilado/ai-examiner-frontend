import Switch from "@/@shared/components/Switch";
import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import { useModalContext } from "@/contexts/ModalContext";
import CloseIcon from "@/icons/CloseIcon";
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
    <div className="w-full relative max-w-[420px] max-md:max-w-[370px] max-sm:max-w-[95vw] rounded-xl shadow-lg p-8 py-14 flex flex-col gap-10 bg-white">
      <button
        className="absolute top-5 right-5 cursor-pointer"
        onClick={() => {
          setModalContent(null);
        }}
      >
        <CloseIcon />
      </button>
      <div>
        <h3 className="font-semibold text-3xl">Options</h3>

        <div className="mt-12 flex flex-col gap-8 text-[#939393]">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-semibold">Negative marking</h5>
              <p className="mt-2 text-sm w-full max-w-[250px] max-sm:max-w-[200px]">
                Turning this on will deduct marks for wrong answers.
              </p>
            </div>
            <Switch
              handleChecked={() => {
                setIsNegativeMarking(!isNegativeMarking);
              }}
              isChecked={isNegativeMarking}
              disabled={false}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold">Timer</h5>
            </div>
            <div className="w-full max-w-[100px]">
              <DropDown
                options={[...calculateRecommendedTimes()]}
                openFromTop={true}
                onChange={(e) => {
                  setSelectedTime(Number(e.target.value));
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            title="Begin test"
            size="large"
            onClick={() => {
              handleBeginTest(selectedTime, isNegativeMarking);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionSettingsDialog;
