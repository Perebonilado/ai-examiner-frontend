import {
  GetMultipleTrueFalseQuestionByIdModel,
  GetQuestionByIdModel,
} from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import CallProgressIndicator from "./CallProgressIndicator";
import CallActionButton from "./CallActionButton";
import { Phone, PhoneOff } from "lucide-react";
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

  // The orb follows whoever is talking: the examiner, or the student (the examiner listens).
  const orbState = !callInProgress
    ? "idle"
    : systemSpeaking
    ? "speaking"
    : "listening";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <CallProgressIndicator state={orbState} />
      </div>

      {data && (
        <div className="flex flex-col items-center gap-3.5 max-md:gap-3">
          {callInProgress && (
            <p className="text-[13px] text-muted">
              Time left:{" "}
              <span className="font-semibold text-ink tabular-nums">
                {timeToDisplay}
              </span>
            </p>
          )}
          {callInProgress ? (
            <CallActionButton
              title="End call"
              tone="end"
              icon={<PhoneOff size={24} strokeWidth={2} aria-hidden />}
              handleClick={() => {
                if (callInProgress) {
                  handleEndCall();
                }
              }}
            />
          ) : (
            <CallActionButton
              title="Start call"
              tone="start"
              icon={<Phone size={24} strokeWidth={2} aria-hidden />}
              handleClick={async () => {
                if (!callInProgress) {
                  await handleStartCall();
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InitiateVivaContainer;
