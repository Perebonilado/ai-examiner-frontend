import React, { FC } from "react";
import { Tooltip as ReactToolTip} from "react-tooltip";

interface Props {
  id: string;
  message: string;
}

const ToolTip: FC<Props> = ({ id, message }) => {
  return (
    <div>
      <p
        data-tooltip-content={message}
        data-tooltip-id={id}
        className="text-xs flex items-center justify-center w-[17px] h-[17px] rounded-full border-[2px] border-black font-bold cursor-pointer"
      >
        i
      </p>
      <ReactToolTip id={id} />
    </div>
  );
};

export default ToolTip;
