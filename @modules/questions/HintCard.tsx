import Button from "@/@shared/ui/Button";
import React, { FC } from "react";
import { useModalContext } from "@/contexts/ModalContext";
import HintIcon from "@/icons/HintIcon";

interface Props {
  hint: string;
}

const HintCard: FC<Props> = ({ hint }) => {
  const { setModalContent } = useModalContext();
  return (
    <div className="w-full max-w-[400px] max-md:max-w-[320px] rounded-xl shadow-lg p-8 py-14 flex flex-col gap-5 text-center items-center justify-center bg-white">
      <h3 className="text-lg font-semibold flex flex-col items-center gap-3">
        <HintIcon width={40} height={40} /> Hint{" "}
      </h3>
      <p className="mb-5">{hint}</p>
      <Button
        title="Close"
        size="large"
        onClick={() => {
          setModalContent(null);
        }}
      />
    </div>
  );
};

export default HintCard;
