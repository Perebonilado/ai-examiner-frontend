import React, { FC } from "react";

interface Props {
  icon: React.ReactNode;
  instruction: string;
}

const CallPrepItem: FC<Props> = ({ icon, instruction }) => {
  return (
    <li className="flex items-center gap-3 border-t border-line py-2.5 text-sm leading-[1.45] text-ink first:border-t-0">
      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] bg-accent-50 text-accent">
        {icon}
      </span>
      <span>{instruction}</span>
    </li>
  );
};

export default CallPrepItem;
