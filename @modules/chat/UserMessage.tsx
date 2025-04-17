import ScaleAndUp from "@/transitions/ScaleAndUp";
import React, { FC } from "react";

interface Props {
  message: string;
}

const UserMessage: FC<Props> = ({ message }) => {
  return (
    <div className="w-full">
      <ScaleAndUp>
        <div className="flex justify-end py-3">
          <p className="p-3 prose prose-sm bg-[#F2E1FF] rounded-xl w-fit max-w-[85%]">
            {message}
          </p>
        </div>
      </ScaleAndUp>
    </div>
  );
};

export default UserMessage;
