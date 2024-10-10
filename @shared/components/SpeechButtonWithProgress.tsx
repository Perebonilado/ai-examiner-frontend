import React, { useState, useEffect, useRef, ElementRef } from "react";
import SpeakerIcon from "@/icons/SpeakerIcon";
import cn from "classnames";
import StopIcon from "@/icons/StopIcon";
import { useConvertTextToSpeechMutation } from "@/api-services/speech.service";
import Spinner from "./Spinner";
import PlayIcon from "@/icons/PlayIcon";

interface SpeechButtonWithProgressProps {
  question: string;
}

export const SpeechButtonWithProgress: React.FC<
  SpeechButtonWithProgressProps
> = ({ question }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<ElementRef<"audio">>(null);

  const [convertTextToSpeech, { data, isLoading }] =
    useConvertTextToSpeechMutation();

  const classNames = cn("bg-[#E5E5E5]", {
    ["animate-pulse"]: isSpeaking,
  });

  const handleClick = () => {
    if (!audioUrl) {
      // Trigger text-to-speech API call
      convertTextToSpeech({ text: question });
    } else {
      if (isSpeaking) {
        // Stop the audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsSpeaking(false);
        }
      } else {
        // Play the audio
        if (audioRef.current) {
          audioRef.current.play();
          setIsSpeaking(true);
        }
      }
    }
  };

  useEffect(() => {
    if (data) {
      try {
        const blob = new Blob([data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (err) {
        console.error("Error creating audio blob:", err);
      }
    }
  }, [data]);

  return (
    <div className="relative min-h-[65px] flex items-center justify-center">
      {audioUrl && (
        <audio
          className="absolute hidden"
          ref={audioRef} // Attach ref to audio element
          onEnded={() => setIsSpeaking(false)} // Stop speaking when audio ends
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      {!isLoading && (
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
            disabled={isLoading}
          >
            {isSpeaking ? (
              <StopIcon />
            ) : audioUrl ? (
              <PlayIcon />
            ) : (
              <SpeakerIcon />
            )}
          </button>
        </div>
      )}
      {isLoading && <Spinner size="sm" />}
    </div>
  );
};
