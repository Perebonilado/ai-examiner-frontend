import React, { FC, useState } from "react";
import cn from "classnames";
import FlashCardItem from "./FlashCardItem/FlashCardItem";
import Button from "@/@shared/ui/Button";
import ArrowAltLeftIcon from "@/icons/ArrowAltLeftIcon";
import ArrowAltRightIcon from "@/icons/ArrowAltRightIcon";

interface Props {
  data: { question: string; answer: string }[];
  handleDone: () => void;
}

const FlashCardItemContainer: FC<Props> = ({ data, handleDone }) => {
  const [currIndex, setCurrIndex] = useState(0);

  return (
    <section className="w-full max-w-[700px] mx-auto">
      <div>
        {data.map((d, idx) => {
          if (idx === currIndex) return <FlashCardItem {...d} key={idx} />;
        })}
      </div>
      <div className="flex items-center gap-1 mt-4">
        {data.map((_, idx) => {
          const progressBarStyling = cn(
            `rounded-full bg-white  border  h-[4px] w-full`,
            {
              "!bg-[#9A67C2] border-[#9A67C2]": currIndex >= idx,
            }
          );
          return <div className={progressBarStyling} key={idx}></div>;
        })}
      </div>
      <div className="flex items-center justify-center mt-10 gap-4">
        <Button
          title=""
          variant="text"
          starticon={<ArrowAltLeftIcon />}
          style={{ fill: currIndex > 0 ? "#360B58" : "#CECECE" }}
          onClick={() => {
            if (currIndex > 0) {
              setCurrIndex((prev) => prev - 1);
            }
          }}
        />
        <div>
          {currIndex + 1}/{data.length}
        </div>
        <Button
          title=""
          variant="text"
          starticon={<ArrowAltRightIcon />}
          style={{ fill: currIndex < data.length - 1 ? "#360B58" : "#CECECE" }}
          onClick={() => {
            if (currIndex < data.length - 1) {
              setCurrIndex((prev) => prev + 1);
            }
          }}
        />
      </div>

      <div className="flex justify-end mt-20">
        <Button title="Done" size="large" onClick={handleDone}/>
      </div>
    </section>
  );
};

export default FlashCardItemContainer;
