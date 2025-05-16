import React, { FC } from "react";
import TestFormatItem, {
  TestFormatItem as TestFormatItemProps,
} from "./TestFormatItem";
import CloseIcon from "@/icons/CloseIcon";
import useClickOutside from "@/hooks/useClickOutside";
import TransitionUp from "@/transitions/TransitionUp";

interface Props {
  testFormats: TestFormatItemProps[];
  handleSelected: (value: number) => void;
  selected?: number;
  handleClose: () => void;
  title?: string;
}

const TestFormatItemContainer: FC<Props> = ({
  testFormats,
  handleSelected,
  selected,
  handleClose,
  title = "Select test format",
}) => {
  const ref = useClickOutside<HTMLDivElement>(() => {
    handleClose();
  });
  return (
    <TransitionUp className="w-full max-w-[420px] max-sm:max-w-[96vw]">
      <div className="bg-white p-6 rounded-2xl" ref={ref}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={() => {
              handleClose();
            }}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-6">
          {testFormats.map((tf, idx) => {
            return (
              <TestFormatItem
                {...tf}
                key={idx}
                handleSelect={handleSelected}
                selected={tf.value === selected}
              />
            );
          })}
        </div>
      </div>
    </TransitionUp>
  );
};

export default TestFormatItemContainer;
