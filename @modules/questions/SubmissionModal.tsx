import Avatar from "@/@shared/components/Avatar";
import React, { forwardRef } from "react";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { generateScoreColor } from "@/utils";

interface Props {
  scorePercentage: number;
}

const SubmissionModal = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const scoreColor = `text-${generateScoreColor(props.scorePercentage).scoreColor}`

  const { setModalContent } = useModalContext();

  return (
    <div
      ref={ref}
      className="w-full max-w-[300px] rounded-xl shadow-lg p-8 flex flex-col gap-4 items-center justify-center bg-white"
    >
      <p
        className={`text-center text-xl font-bold`}
        style={{ color: scoreColor }}
      >
        Score - {props.scorePercentage}%
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
