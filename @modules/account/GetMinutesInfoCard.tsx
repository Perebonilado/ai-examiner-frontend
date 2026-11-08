import React, { FC } from "react";
import { Timer } from "lucide-react";

const GetMinutesInfoCard: FC = () => {
  return (
    <>
      <p className="mt-2 max-w-[46ch] text-sm leading-[1.65] text-subtle">
        To participate in viva calls and connect with the AI over voice calls,
        you&apos;ll need credits. It&apos;s important to manage these credits
        carefully as they are consumed based on the duration of your calls.
      </p>
      <p className="mt-3.5 flex items-center gap-2.5 text-[13px] text-subtle md:mt-5">
        <Timer size={16} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden="true" />
        Each viva call lasts a maximum of 2 minutes.
      </p>
    </>
  );
};

export default GetMinutesInfoCard;
