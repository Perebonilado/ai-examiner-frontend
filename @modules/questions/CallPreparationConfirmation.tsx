import React, { FC } from "react";
import CallPrepItem from "./CallPrepItem";
import Button from "@/@shared/ui/Button";
import CloseIcon from "@/icons/CloseIcon";
import { useModalContext } from "@/contexts/ModalContext";
import UserSpeaking from "@/icons/UserSpeaking";
import BarChartIcon from "@/icons/BarChartIcon";
import NotificationIcon from "@/icons/NotificationIcon";
import HourGlassIcon from "@/icons/HourGlassIcon";

interface Props {
  handleProceed: () => void;
}

const CallPreparationConfirmation: FC<Props> = ({ handleProceed }) => {
  const { setModalContent } = useModalContext();
  return (
    <div className="w-full max-w-[400px] p-6 bg-white rounded-xl">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-3">Get ready for your AI call</h2>
      <p className="text-sm">
        For the best experience, ensure you're in a quiet place
      </p>

      <div className="my-8 w-full rounded-xl bg-[#F4F4F4] p-6 flex flex-col gap-4">
        <CallPrepItem
          instruction="This call will have verbal questions."
          icon={<UserSpeaking />}
        />
        <CallPrepItem
          instruction="AI will analyze your responses to assess your performance."
          icon={<BarChartIcon />}
        />
        <CallPrepItem
          instruction="This call is timed and will last for a maximum duration of 2 minutes."
          icon={<HourGlassIcon />}
        />
        <CallPrepItem
          instruction="You will receive a confirmation when your performance is ready for review."
          icon={<NotificationIcon />}
        />
      </div>

      <p className="text-xs italic text-[#00000080] mb-6 text-center">
        By proceeding, you agree to have your responses recorded and processed.
        View our{" "}
        <span className="text-[#9A67E2]">
          <a href="https://aiexaminer.app/privacy-policy" target="_blank">
            Privacy Policy
          </a>
        </span>{" "}
        for more details.
      </p>

      <div className="flex justify-center">
        <Button title="Proceed" size="large" onClick={handleProceed} />
      </div>
    </div>
  );
};

export default CallPreparationConfirmation;
