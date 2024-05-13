import Avatar from "@/@shared/components/Avatar";
import { generateScoreDescription } from "@/utils";
import React, { forwardRef } from "react";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";

interface Props {
  scorePercentage: number;
}

const SubmissionModal = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { image, message, scoreColor } = generateScoreDescription(
    props.scorePercentage
  );

  const { setModalContent } = useModalContext();

  return (
    <div
      ref={ref}
      className="w-full max-w-[400px] rounded-xl shadow-lg p-8 flex flex-col gap-4 items-center justify-center bg-white"
    >
      <p
        className={`text-center text-xl font-bold`}
        style={{ color: scoreColor }}
      >
        Score: {props.scorePercentage}%
      </p>
      <Avatar
        alt="meme"
        fallBack="Paw"
        imageUrl={image}
        shape="square"
        size="lg"
      />
      <p
        className="text-center  text-black text-lg font-bold"
        style={{ color: scoreColor }}
      >
        {message}
      </p>

      <Button
        title="Review answers"
        onClick={() => {
          setModalContent(null);
        }}
      />
    </div>
  );
});

export default SubmissionModal;
