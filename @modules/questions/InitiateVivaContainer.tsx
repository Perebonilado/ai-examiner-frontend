import {
  GetMultipleTrueFalseQuestionByIdModel,
  GetQuestionByIdModel,
} from "@/models/questions.model";
import React, { FC } from "react";
import CallProgressIndicator from "./CallProgressIndicator";
import SoundWaveIcon from "@/icons/SoundWaveIcon";
import CallActionButton from "./CallActionButton";
import EndCallIcon from "@/icons/EndCallIcon";
import StartCallIcon from "@/icons/StartCallIcon";
import MicIcon from "@/icons/MicIcon";

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
}

const InitiateVivaContainer: FC<Props> = ({
  callInProgress,
  data,
  systemSpeaking,
  userSpeaking,
  handleStartCall,
  handleEndCall,
}) => {
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

      <div className="mt-16 flex flex-col gap-10">
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
