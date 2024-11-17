import React, { useEffect, useState } from "react";
import cn from 'classnames'

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

  const strokeStyle = cn({
    ['stroke-[#2F004F]']: progress > 20,
    ['stroke-rose-600']: progress < 20
  })

  // Calculate circle properties
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed top-20 z-[100] right-5 ">
      <div className="relative inline-flex items-center justify-center">
        {/* SVG for circular progress */}
        <svg className="w-24 h-24 transform -rotate-90 ">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-gray-200"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={strokeStyle}
            strokeWidth="8"
            fill="white"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>
        {/* Time display */}
        <span className="absolute text-lg font-semibold">{timeString}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
