import React, { FC, useState } from "react";

interface Props {
  handleClick: () => void;
}

const ViewFileReaderThumbnail: FC<Props> = ({ handleClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={handleClick}
      className="relative w-52 h-40 cursor-pointer rounded-xl shadow-lg transition-all duration-300 overflow-hidden backdrop-blur-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? "translateY(-4px)" : "translateY(0px)",
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-white bg-opacity-10" />

      {/* Frosted border accent */}
      <div className="absolute inset-0 border border-white border-opacity-20 rounded-xl pointer-events-none" />

      {/* Centered icon and text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 mb-2 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium">Click to read file</p>
      </div>
    </div>
  );
};

export default ViewFileReaderThumbnail;
