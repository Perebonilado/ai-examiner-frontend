import React, { FC } from "react";

interface Props {
  icon: React.ReactNode;
  speaker: string;
  isSpeaking: boolean;
}

const CallProgressIndicator: FC<Props> = ({ icon, isSpeaking, speaker }) => {
  return (
    <div className="relative w-full max-w-[350px] h-[200px] mx-auto">
      {/* Gradient Border Layer */}
      {isSpeaking && <div className="absolute inset-0 bg-gradient-to-r from-[#9A67E2] to-[#F89AEE] rounded-3xl"></div>}
      
      {/* Inner content with slightly smaller dimensions to show the border */}
      <div className="absolute inset-[3px] flex items-center justify-center bg-[#F4F4F4] rounded-3xl shadow-md">
        {icon}
        <p className="absolute bottom-2 left-4 bg-[#00000080] text-white text-xs min-w-[80px] rounded-full text-center px-2 py-1">
          {speaker}
        </p>
      </div>
    </div>
  );
};

export default CallProgressIndicator;