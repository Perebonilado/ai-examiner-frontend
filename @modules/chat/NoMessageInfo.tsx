import TransitionUp from "@/transitions/TransitionUp";
import React, { FC } from "react";

interface Props {
  documentTitle: string;
}

const NoMessageInfo: FC<Props> = ({ documentTitle }) => {
  return (
    <div className="w-full mt-[80%]">
      <p className="text-center text-gray-300 text-base mb-6">
        Let's explore {documentTitle} together
      </p>
      <ul className="flex flex-col gap-3 pb-4">
        <li className="text-xs font-medium text-[#360B58]">I can help:</li>
        {[
          "Summarize topics",
          "Simplify key concepts",
          "Answer specific questions about this topic",
        ].map((title, idx) => {
          return (
            <TransitionUp key={idx}>
              <li className="text-xs border border-gray-300 font-medium w-fit p-2 rounded-xl">
                {title}
              </li>
            </TransitionUp>
          );
        })}
      </ul>
    </div>
  );
};

export default NoMessageInfo;
