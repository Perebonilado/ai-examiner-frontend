import React, { FC } from "react";
import TestFormatItem, {
  TestFormatItem as TestFormatItemProps,
} from "./TestFormatItem";
import useClickOutside from "@/hooks/useClickOutside";
import { DialogFrame, DialogHeader } from "./DialogFrame";

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
    <DialogFrame ref={ref} widthClass="max-w-[440px]" labelledBy="format-title">
      <DialogHeader
        title={title}
        titleId="format-title"
        onClose={() => {
          handleClose();
        }}
      />
      <div
        role="radiogroup"
        aria-labelledby="format-title"
        className="flex flex-col gap-2 px-5 pt-4 pb-5 max-md:pb-[calc(20px+env(safe-area-inset-bottom))]"
      >
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
    </DialogFrame>
  );
};

export default TestFormatItemContainer;
