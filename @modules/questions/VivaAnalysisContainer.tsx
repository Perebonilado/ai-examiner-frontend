import Button from "@/@shared/ui/Button";
import React, { FC, useEffect, useRef, useState } from "react";
import VivaAnalysisItemAccordion from "./VivaAnalysisItemAccordion";
import { VivaAnalysisModel } from "@/models/viva.model";
import { useGetVivaRecordingQuery } from "@/api-services/questions.service";
import PlayIcon from "@/icons/PlayIcon";
import IconButton from "@/@shared/ui/IconButton";
import PauseIcon from "@/icons/PauseIcon";

interface Props {
  data: VivaAnalysisModel[];
  callId: string;
}

const VivaAnalysisContainer: FC<Props> = ({ data, callId }) => {
  const { data: callRecording } = useGetVivaRecordingQuery({ callId });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    if (callRecording?.callRecording) {
      const recording = new Audio(callRecording.callRecording);
      audioRef.current = recording;

      // Set event listeners for metadata and time updates
      recording.onloadedmetadata = () => {
        setDuration(recording.duration);
      };

      recording.ontimeupdate = () => {
        setCurrentTime(recording.currentTime);
      };

      recording.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [callRecording]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Format time in mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="mx-auto w-fit mb-10 min-w-[250px]">
        {callRecording && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <IconButton
                icon={
                  isPlaying ? (
                    <PauseIcon fill="white" />
                  ) : (
                    <PlayIcon fill="white" />
                  )
                }
                onClick={togglePlay}
              />
              <p className="text-sm font-medium text-gray-400">
                {isPlaying ? "Pause" : "Play"} Conversation
              </p>
            </div>
            {duration > 0 && (
              <div className="mt-3 w-full max-w-[400px]">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Number(e.target.value);
                      setCurrentTime(Number(e.target.value));
                    }
                  }}
                  className="w-full appearance-none focus:outline-none 
             [&::-webkit-slider-runnable-track]:bg-[#D9C4F2] 
             [&::-webkit-slider-runnable-track]:h-2 
             [&::-webkit-slider-runnable-track]:rounded-full 
             [&::-webkit-slider-thumb]:appearance-none 
             [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
             [&::-webkit-slider-thumb]:bg-[#9A67E2] 
             [&::-webkit-slider-thumb]:rounded-full 
             [&::-webkit-slider-thumb]:mt-[-6px] 
             [&::-webkit-slider-thumb]:shadow-md 
             [&::-webkit-slider-thumb]:hover:scale-110 
             [&::-webkit-slider-thumb]:active:scale-90 
             [&::-moz-range-track]:bg-[#D9C4F2] 
             [&::-moz-range-track]:h-2 
             [&::-moz-range-track]:rounded-full 
             [&::-moz-range-thumb]:bg-[#9A67E2] 
             [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 
             [&::-moz-range-thumb]:rounded-full 
             [&::-moz-range-thumb]:shadow-md 
             [&::-moz-range-thumb]:hover:scale-110 
             [&::-moz-range-thumb]:active:scale-90"
                />
                <p className="text-sm w-full justify-between flex mt-2 text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {data.map((item, idx) => (
        <VivaAnalysisItemAccordion {...item} key={idx} />
      ))}
    </div>
  );
};

export default VivaAnalysisContainer;
