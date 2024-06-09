import Button from "@/@shared/ui/Button";
import HintIcon from "@/icons/HintIcon";
import React, { FC, useState } from "react";
import s from "./styles.module.css";
import { useModalContext } from "@/contexts/ModalContext";
import HintCard from "../HintCard";

interface Props {
  question: string;
  answer: string;
  hint?: string;
}

const FlashCardItem: FC<Props> = ({ question, answer, hint }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const { setModalContent } = useModalContext();

  return (
    <div
      className={`${s["perspective-1000"]} w-full max-w-[700px] bg-transparent`}
    >
      <div
        className={`relative w-full min-h-[400px] transition-transform duration-500 bg-transparent ${
          s["transform-style-preserve-3d"]
        } ${isFlipped ? s["rotate-y-180"] : ""}`}
      >
        <div
          className={`border bg-transparent shadow-md border-gray-200 rounded-lg absolute p-4 ${s["backface-hidden"]} w-full min-h-full flex flex-col`}
        >
          {hint && (
            <div
              className="flex items-center gap-2 w-fit cursor-pointer"
              style={{ flex: 1 }}
            >
              <Button
                onClick={() => {
                  setModalContent(<HintCard hint={hint} />);
                }}
                variant="text"
                title="Hint"
                starticon={<HintIcon />}
              />
            </div>
          )}
          <div
            className="flex flex-col gap-8 items-center justify-center p-2"
            style={{ flex: 8 }}
          >
            <p className="text-lg text-center leading-relaxed">
              {question} 
            </p>
            <Button
              title="Show Answer"
              variant="outlined"
              size="large"
              onClick={handleFlip}
            />
          </div>
        </div>
        <div
          className={`bg-transparent border shadow-md border-gray-200 flex gap-8 flex-col items-center justify-center rounded-lg absolute ${s["backface-hidden"]} w-full min-h-full transform ${s["rotate-y-180"]}`}
        >
          <p className="text-lg text-center leading-relaxed">{answer}</p>
          <div onClick={handleFlip}>
            <Button title="Hide Answer" variant="outlined" size="large" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCardItem;
