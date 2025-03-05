import React, { FC } from "react";

const PulseCallIndicator: FC = () => {
  return (
    <div className="w-[15px] h-[15px] rounded-full flex items-center justify-center border border-[#27AA06] animate-pulse">
      <div className="w-[70%] h-[70%] rounded-full bg-[#27AA06]"></div>
    </div>
  );
};

export default PulseCallIndicator;
