import React, { useState, useEffect } from "react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import SpeakerIcon from "@/icons/SpeakerIcon";
import cn from "classnames";
import StopIcon from "@/icons/StopIcon";

interface SpeechButtonWithProgressProps {
  question: string;
}

export const SpeechButtonWithProgress: React.FC<
  SpeechButtonWithProgressProps
> = ({ question }) => {
  const { speak, stopSpeaking, isSpeaking } = useSpeechToText();

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(question);
    }
  };

  const classNames = cn(``, {
    ["animate-pulse bg-[#ffcccc]"]: isSpeaking,
    ["bg-[#f0f0f0]"]: !isSpeaking,
  });

  return (
    <div style={{ position: "relative", width: "60px", height: "60px" }}>
      <button
        onClick={handleClick}
        className={classNames}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          border: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
      </button>
    </div>
  );
};
