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
    <div className="w-full max-w-[350px] h-[160px] rounded-t-3xl rounded-b-lg bg-white flex flex-col items-center justify-center">
      <h2 className="text-center text-xl font-bold">Connecting your call...</h2>
      <p className="text-sm text-center mt-3">This may take a few minutes</p>

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
