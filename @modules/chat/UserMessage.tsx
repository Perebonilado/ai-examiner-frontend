import ScaleAndUp from "@/transitions/ScaleAndUp";
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  message: string;
  image?: string;
}

const UserMessage: FC<Props> = ({ message, image }) => {
  return (
    <div className="w-full">
      <ScaleAndUp>
        <div className="flex justify-end py-3">
          <div className="p-3 prose prose-sm bg-[#F2E1FF] rounded-xl w-fit max-w-[85%]">
            {image && (
              <img
                src={image}
                alt="image attachment"
                className="object-contain w-full h-auto rounded-lg border m-0"
              />
            )}
            <p
              className={cn(``, {
                ["!mt-2"]: image,
              })}
            >
              {message}
            </p>
          </div>
        </div>
      </ScaleAndUp>
    </div>
  );
};

export default UserMessage;
