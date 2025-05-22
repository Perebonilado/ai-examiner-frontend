import TransitionUp from "@/transitions/TransitionUp";
import React, { FC } from "react";

export interface ISupportLearningItem {
  title: string;
  body: string;
  icon: React.ReactNode;
}

const SupportLearningItem: FC<ISupportLearningItem> = ({
  body,
  icon,
  title,
}) => {
  return (
    <TransitionUp>
      <div className="w-full max-w-[270px] h-[380px] border border-[#9D6EC2] rounded-xl shadow-xl p-6">
        <div className="h-[30%]">{icon}</div>
        <div className="h-[70%] flex flex-col gap-2">
          <h3 className="text-2xl ">{title}</h3>
          <p className="text-base font-light">{body}</p>
        </div>
      </div>
    </TransitionUp>
  );
};

export default SupportLearningItem;
