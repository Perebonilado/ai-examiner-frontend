import React, { FC } from "react";

interface Props {
  documentTitle: string;
}

const NoMessageInfo: FC<Props> = ({ documentTitle }) => {
  return (
    <div className="w-full h-1/2 absolute bottom-0 px-3 left-1/2 -translate-x-1/2 flex flex-col justify-between">
      <p className="text-center text-gray-300 text-base">
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
            <li key={idx} className="text-xs border border-gray-300 font-medium w-fit p-2 rounded-xl">
              {title}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default NoMessageInfo;
