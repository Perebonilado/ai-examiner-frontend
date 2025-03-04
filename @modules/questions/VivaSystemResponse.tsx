import GoggleIcon from "@/icons/GoggleIcon";
import React, { FC } from "react";

interface Props {
  systemResponse: string;
}

const VivaSystemResponse: FC<Props> = ({ systemResponse }) => {
  return (
    <div className="my-6 relative rounded-2xl" style={{ 
      background: "linear-gradient(to right, #9A67E2, #F89AEE)",
      padding: "2px" // Border thickness
    }}>
      <div className="p-4 rounded-2xl bg-[#F2E1FF] h-full w-full">
        <div className="flex">
          <div className="pr-4">
            <GoggleIcon />
          </div>
          <div style={{ flex: 1 }}>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Evaluation</span>
            </p>
            <p className="font-light text-sm mt-4">{systemResponse}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VivaSystemResponse;