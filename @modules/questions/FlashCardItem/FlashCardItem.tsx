import Button from "@/@shared/ui/Button";
import HintIcon from "@/icons/HintIcon";
import React, { FC, useState } from "react";
import s from "./styles.module.css";

interface Props {
  question: string;
  answer: string;
}

const FlashCardItem: FC<Props> = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`${s["perspective-1000"]} w-full max-w-[700px] bg-transparent`}
    >
      <div
        className={`relative w-full min-h-[300px] transition-transform duration-500 bg-transparent ${
          s["transform-style-preserve-3d"]
        } ${isFlipped ? s["rotate-y-180"] : ""}`}
      >
        <div
          className={`border bg-transparent shadow-md border-gray-200 rounded-lg absolute p-4 ${s["backface-hidden"]} w-full h-full flex flex-col`}
        >
          <div
            className="flex items-center gap-2 w-fit cursor-pointer"
            style={{ flex: 1 }}
          >
            <HintIcon />
            <p className="text-sm">Hint</p>
          </div>
          <div
            className="flex flex-col gap-8 items-center justify-center p-2"
            style={{ flex: 8 }}
          >
            <p className="text-lg text-center leading-relaxed">{question}</p>
            <Button
              title="Show Answer"
              variant="outlined"
              size="large"
              onClick={handleFlip}
            />
          </div>
        </div>
        <div
          className={`bg-transparent border shadow-md border-gray-200 flex gap-8 flex-col items-center justify-center rounded-lg absolute ${s["backface-hidden"]} w-full h-full transform ${s["rotate-y-180"]}`}
        >
          <p className="text-lg text-center leading-relaxed">{answer}</p>
          <Button
            title="Show Question"
            variant="outlined"
            size="large"
            onClick={handleFlip}
          />
        </div>
      </div>
    </div>
  );
};

export default FlashCardItem;
