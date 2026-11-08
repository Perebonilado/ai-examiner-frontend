import React, { useState, useEffect, useRef, ElementRef } from "react";
import cn from "classnames";
import { Loader2, Play, Square, Volume2 } from "lucide-react";
import { useConvertTextToSpeechMutation } from "@/api-services/speech.service";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";

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

  const { selectedLanguageName } = useGoogleTranslationContext();

  useEffect(() => {
    if (isSpeaking) {
      setIsSpeaking(false);
      stop();
    }
    setAudioUrl(null);
  }, [selectedLanguageName]);

  const handleClick = () => {
    if (!audioUrl) {
      // Trigger text-to-speech API call
      convertTextToSpeech({
        text: question,
        language: selectedLanguageName || "English",
      });
    } else {
      if (isSpeaking) {
        // Stop the audio
        if (audioRef.current) {
          stop();
        }
      } else {
        // Play the audio
        if (audioRef.current) {
          play();
        }
      }
    }
  };

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsSpeaking(true);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
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

    return () => {
      stop();
    };
  }, [data]);

  const label = isLoading
    ? "Preparing audio"
    : isSpeaking
    ? "Stop reading"
    : audioUrl
    ? "Play again"
    : "Read aloud";

  /* A 36px ghost icon button: grey speaker, violet while it reads. */
  return (
    <span className="relative inline-flex">
      {audioUrl && (
        <audio
          className="hidden"
          ref={audioRef}
          onEnded={() => setIsSpeaking(false)}
        >
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={label}
        aria-pressed={isSpeaking}
        title={label}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg transition-colors disabled:cursor-wait",
          isSpeaking
            ? "bg-accent-50 text-accent"
            : "text-subtle hover:bg-hover hover:text-ink"
        )}
      >
        {isLoading ? (
          <Loader2 size={16} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />
        ) : isSpeaking ? (
          <Square size={14} strokeWidth={1.75} aria-hidden="true" className="fill-current" />
        ) : audioUrl ? (
          <Play size={16} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Volume2 size={16} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </span>
  );
};
