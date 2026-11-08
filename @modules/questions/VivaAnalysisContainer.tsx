import React, { FC, useEffect, useRef, useState } from "react";
import VivaAnalysisItemAccordion from "./VivaAnalysisItemAccordion";
import { VivaAnalysisModel } from "@/models/viva.model";
import { useGetVivaRecordingQuery } from "@/api-services/questions.service";
import { Pause, Play } from "lucide-react";

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
    <div className="mx-auto w-full max-w-[740px]">
      {callRecording && (
        <div className="mb-7 flex items-center gap-3.5 rounded-2xl border border-edge bg-surface px-4 py-3.5 shadow-xs max-md:mb-5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause conversation" : "Play conversation"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
          >
            {isPlaying ? (
              <Pause size={16} strokeWidth={2} fill="currentColor" aria-hidden />
            ) : (
              <Play
                size={16}
                strokeWidth={2}
                fill="currentColor"
                className="translate-x-px"
                aria-hidden
              />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              {isPlaying ? "Pause" : "Play"} conversation
            </p>
            {duration > 0 && (
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  aria-label="Conversation position"
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Number(e.target.value);
                      setCurrentTime(Number(e.target.value));
                    }
                  }}
                  className="h-4 flex-1 cursor-pointer appearance-none bg-transparent focus:outline-none
             [&::-webkit-slider-runnable-track]:h-1.5
             [&::-webkit-slider-runnable-track]:rounded-full
             [&::-webkit-slider-runnable-track]:bg-sunken
             [&::-webkit-slider-thumb]:mt-[-5px]
             [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
             [&::-webkit-slider-thumb]:appearance-none
             [&::-webkit-slider-thumb]:rounded-full
             [&::-webkit-slider-thumb]:bg-accent
             [&::-webkit-slider-thumb]:shadow-xs
             focus-visible:[&::-webkit-slider-thumb]:outline
             focus-visible:[&::-webkit-slider-thumb]:outline-2
             focus-visible:[&::-webkit-slider-thumb]:outline-offset-2
             focus-visible:[&::-webkit-slider-thumb]:outline-accent-bright
             [&::-moz-range-track]:h-1.5
             [&::-moz-range-track]:rounded-full
             [&::-moz-range-track]:bg-sunken
             [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
             [&::-moz-range-thumb]:rounded-full
             [&::-moz-range-thumb]:border-0
             [&::-moz-range-thumb]:bg-accent"
                />
                <span className="shrink-0 text-xs text-muted tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-7 max-md:gap-5">
        {data.map((item, idx) => (
          <VivaAnalysisItemAccordion {...item} key={idx} />
        ))}
      </div>
    </div>
  );
};

export default VivaAnalysisContainer;
