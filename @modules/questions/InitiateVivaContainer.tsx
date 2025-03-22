import {
  GetMultipleTrueFalseQuestionByIdModel,
  GetQuestionByIdModel,
} from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import CallProgressIndicator from "./CallProgressIndicator";
import SoundWaveIcon from "@/icons/SoundWaveIcon";
import CallActionButton from "./CallActionButton";
import EndCallIcon from "@/icons/EndCallIcon";
import StartCallIcon from "@/icons/StartCallIcon";
import MicIcon from "@/icons/MicIcon";
import { reduxStore } from "@/config/redux-config";
import { CallCreditsService } from "@/api-services/call-credits.service";
import { useModalContext } from "@/contexts/ModalContext";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import { useRouter } from "next/router";

interface Props {
  data?:
    | GetQuestionByIdModel
    | GetMultipleTrueFalseQuestionByIdModel
    | undefined;
  callInProgress: boolean;
  systemSpeaking: boolean;
  userSpeaking: boolean;
  handleStartCall: () => Promise<void>;
  handleEndCall: () => void;
  maxCallDurationInSeconds: number;
}

const InitiateVivaContainer: FC<Props> = ({
  callInProgress,
  data,
  systemSpeaking,
  userSpeaking,
  handleStartCall,
  handleEndCall,
  maxCallDurationInSeconds,
}) => {
  const [timeLeft, setTimeLeft] = useState(maxCallDurationInSeconds);
  const [timeToDisplay, setTimeToDisplay] = useState<string | null>(null);
  const { setModalContent } = useModalContext();
  const router = useRouter();

  let interval: NodeJS.Timeout | null;

  useEffect(() => {
    setTimeLeft(maxCallDurationInSeconds);
  }, []);

  useEffect(() => {
    if (callInProgress) {
      interval = setInterval(() => {
        if (timeLeft === 1) {
          resetTimer();
          setTimeLeft(0);
          handleEndCall();
          setModalContent(
            <ConfirmationDialog
              confirmationText="Purchase credits"
              message="Please, purchase credits to continue"
              title="Oops! You ran out of call credits"
              cancelText="Cancel"
              onConfirm={() => {
                router.push("/account/call-credits");
              }}
              onCancel={() => setModalContent(null)}
            />
          );
          reduxStore.dispatch(
            CallCreditsService.util.invalidateTags([{ type: "call-credits" }])
          );
        } else {
          setTimeLeft((val) => val - 1);
        }
      }, 1000);
    } else {
      setTimeLeft(maxCallDurationInSeconds);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callInProgress]);

  const resetTimer = () => {
    if (interval) clearInterval(interval);
  };

  const handleCountDown = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);

    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    setTimeToDisplay(timeString);
  };

  useEffect(() => {
    handleCountDown();
  }, [timeLeft]);

  return (
    <div>
      {data && (
        <div className="mx-auto w-full max-w-[500px] flex justify-center gap-10 pb-6 border-b mt-10">
          <CallActionButton
            title="Start call"
            icon={
              <StartCallIcon fill={!callInProgress ? "#008650" : "#9ca3af"} />
            }
            isActive={!callInProgress}
            activeColor="#008650"
            handleClick={async () => {
              if (!callInProgress) {
                await handleStartCall();
              }
            }}
          />
          <CallActionButton
            title="End call"
            icon={<EndCallIcon fill={callInProgress ? "#EE6161" : "#9ca3af"} />}
            isActive={callInProgress}
            activeColor="#EE6161"
            handleClick={() => {
              if (callInProgress) {
                handleEndCall();
              }
            }}
          />
        </div>
      )}

      {data && callInProgress && (
        <p className="mx-auto w-full max-w-[500px] text-[#00000080] mt-6 text-sm">
          Time Left: {timeToDisplay}
        </p>
      )}
      <div className="mt-10 flex flex-col gap-10">
        <CallProgressIndicator
          icon={<SoundWaveIcon fill={systemSpeaking ? "#9A67E2" : undefined} />}
          speaker="Examiner"
          isSpeaking={systemSpeaking}
        />
        <CallProgressIndicator
          icon={<MicIcon fill={userSpeaking ? "#9A67E2" : undefined} />}
          speaker="You"
          isSpeaking={userSpeaking}
        />
      </div>
    </div>
  );
};

export default InitiateVivaContainer;
