import React, { useEffect, useState } from "react";
import cn from "classnames";
import ChevronLeft from "@/icons/ChevronLeft";
import ChevronRight from "@/icons/ChevronRight";
import ChevronRightAlt from "@/icons/ChevronRightAlt";

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

  const [isHidden, setIsHidden] = useState(false);

  const baseClassNames = cn(
    `fixed top-24  z-[100] cursor-pointer transition-all`,
    {
      ["-right-7"]: !isHidden,
      ["-right-24"]: isHidden,
    }
  );

  useEffect(() => {
    if (progress === 20 && isHidden) {
      setIsHidden(false);
    }
  }, [progress, isHidden]);

  return (
    <div
      className={baseClassNames}
      onClick={() => {
        setIsHidden(!isHidden);
      }}
    >
      <div className="relative inline-flex items-center justify-center shadow-md rounded-tl-full rounded-bl-full bg-white h-[70px]">
        {/* SVG for circular progress */}
        <button className="pl-2">
          {!isHidden ? <ChevronRightAlt />: <ChevronLeft />}
        </button>
        <svg className="w-24 h-24 transform -rotate-90 -translate-x-[12px]">
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
        <span className="absolute translate-x-[4px] text-xs font-semibold">
          {timeString}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
