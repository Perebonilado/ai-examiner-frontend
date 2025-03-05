import React, { FC } from "react";

interface Props {
  icon: React.ReactNode;
  instruction: string;
}

const CallPrepItem: FC<Props> = ({ icon, instruction }) => {
  return (
    <div className="flex items-center gap-3 text-xs">
      {icon} <p>{instruction}</p>
    </div>
  );
};

export default CallPrepItem;
