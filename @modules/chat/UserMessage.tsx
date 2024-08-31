import React, { FC } from "react";

interface Props {
  message: string;
}

const UserMessage: FC<Props> = ({ message }) => {
  return (
    <div className="w-full flex justify-end py-3">
      <p className="p-3 bg-[#F2E1FF] rounded-xl w-fit max-w-[70%]">{message}</p>
    </div>
  );
};

export default UserMessage;
