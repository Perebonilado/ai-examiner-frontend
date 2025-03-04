import React, { FC } from "react";
import cn from "classnames";
import UserIcon from "@/icons/UserIcon";

interface Props {
  userResponse: string;
  grade: "pass" | "fail";
}

const VivaUserResponse: FC<Props> = ({ grade, userResponse }) => {
  const classNames = cn(`p-4 border-[2px]  rounded-2xl my-6`, {
    ["border-[#EE6161] bg-[#EE61611A]"]: grade === "fail",
    ["border-[#008650] bg-[#0086501A]"]: grade === "pass",
  });
  return (
    <div className={classNames}>
      <div className="flex">
        <div className="pr-4">
          <UserIcon />
        </div>
        <div style={{ flex: 1 }}>
          <p className="flex items-center gap-2">
            <span className="font-semibold">Your response</span>
            <span className="text-[#00000080]">|</span>
            <span className="text-xl text-[#00000080]">Summary</span>
          </p>
          <p className="font-light text-sm mt-4">{userResponse}</p>
        </div>
      </div>
    </div>
  );
};

export default VivaUserResponse;
