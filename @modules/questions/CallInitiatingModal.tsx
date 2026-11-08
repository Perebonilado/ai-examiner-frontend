import React, { ElementRef, FC, useEffect, useRef, useState } from "react";

const CallInitiatingModal: FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sounds/phone_ringing.mp3");
    audio.loop = true;
    audioRef.current = audio;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      }
    };

    playAudio(); // Try playing immediately

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const buttonRef = useRef<ElementRef<"button">>(null);

  useEffect(() => {
    if (audioRef && !isPlaying) {
      buttonRef.current?.click();
    }
  }, [audioRef, isPlaying]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-[min(360px,calc(100vw-40px))] rounded-2xl border border-edge bg-surface px-6 py-8 text-center shadow-pop"
    >
      <h2 className="text-lg font-bold tracking-[-0.015em] text-ink">
        Connecting your call...
      </h2>
      <p className="mt-1.5 text-sm text-subtle">This may take a few minutes</p>

      {!isPlaying && (
        <button
          ref={buttonRef}
          onClick={() => audioRef.current?.play()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hidden"
        >
          Play Sound
        </button>
      )}
    </div>
  );
};

export default CallInitiatingModal;
