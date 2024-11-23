import React, { useEffect, useState } from "react";

interface CountdownProps {
  timeLeft: number; // Time in seconds
  totalDuration?: number; // Optional total duration for progress calculation
}

const CountdownTimer: React.FC<CountdownProps> = ({
  timeLeft,
  totalDuration,
}) => {
  const [progress, setProgress] = useState(100);

  // Calculate minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Format time as mm:ss
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  useEffect(() => {
    // Calculate progress percentage
    const duration = totalDuration || timeLeft;
    const progressPercentage = (timeLeft / duration) * 100;
    setProgress(progressPercentage);
  }, [timeLeft, totalDuration]);

  // Calculate circle properties
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed top-24  z-[100] right-0 ">
      <div className="relative inline-flex items-center justify-center shadow-md rounded-tl-full rounded-bl-full bg-white h-[70px]">
        {/* SVG for circular progress */}
        <svg className="w-24 h-24 transform -rotate-90 -translate-x-[10px]">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-gray-200"
            strokeWidth="5"
            fill="transparent"
          />
          {/* Progress circle */}
          {progress < 20 ? (
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={"stroke-rose-600"}
              strokeWidth="5"
              fill="white"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
          ) : (
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={"stroke-[#2F004F]"}
              strokeWidth="5"
              fill="white"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
          )}
        </svg>
        {/* Time display */}
        <span className="absolute -translate-x-[10px] text-xs font-semibold">{timeString}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
