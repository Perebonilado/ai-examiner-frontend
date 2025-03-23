import Button from "@/@shared/ui/Button";
import { useRouter } from "next/router";
import React, { FC } from "react";

interface Props {
  minuteLeft?: string;
}

const GetMoreCreditsCard: FC<Props> = ({ minuteLeft = "--" }) => {
  const router = useRouter();
  return (
    <div className="w-fit py-2 border border-[#CECECE] rounded-lg bg-[#F2E1FF] flex items-center">
      <div
        style={{ flex: 1 }}
        className="border-r border-r-gray-400 px-3 min-h-[30px] flex items-center justify-center"
      >
        <p className="text-xs">
          {minuteLeft} <span className="text-[#00000080]">mins left</span>
        </p>
      </div>
      <div
        style={{ flex: 1 }}
        className="px-3 flex justify-center items-center"
      >
        <Button
          size="small"
          title="Get more"
          className="min-w-[100px]"
          onClick={() => {
            router.push("/account/call-credits");
          }}
        />
      </div>
    </div>
  );
};

export default GetMoreCreditsCard;
