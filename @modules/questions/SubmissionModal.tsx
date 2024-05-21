import Avatar from "@/@shared/components/Avatar";
import React, { forwardRef } from "react";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import {
  generateDocumentCardColorFromScore,
  generateScoreColor,
} from "@/utils";

interface Props {
  scorePercentage: number;
  title: string;
}

const SubmissionModal = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const color = generateDocumentCardColorFromScore(props.scorePercentage);

  const { setModalContent } = useModalContext();

  return (
    <div
      ref={ref}
      className="w-full max-w-[300px] rounded-xl shadow-lg p-8 flex flex-col gap-10 items-center justify-center bg-white"
    >
      <p className="text-lg text-center font-bold">{props.title}</p>

      <div
        className="w-[150px] h-[150px] rounded-full flex flex-col items-center justify-center text-center gap-2"
        style={{
          borderColor: color.fill,
          background: color.background,
          borderWidth: "2px",
        }}
      >
        <p className="text-2xl text-center font-bold">{props.scorePercentage.toFixed()}%</p>
        <p className="text-xs font-semibold">{color.message}</p>
      </div>

      <p className="text-sm text-gray-500 text-center">{color.subMessage}</p>

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
