import React, { FC } from "react";

interface Props {
  message: string;
  image?: string;
}

// Your message: a soft bubble on the right.
const UserMessage: FC<Props> = ({ message, image }) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[82%] px-3.5 py-[9px] rounded-[18px] bg-hover text-sm leading-normal text-ink break-words">
        {image && (
          <img
            src={image}
            alt="image attachment"
            className="w-full h-auto object-contain rounded-xl border border-line mb-2"
          />
        )}
        <p className="whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default UserMessage;
