import React, { FC, PropsWithChildren } from "react";
import { Tooltip as ReactToolTip } from "react-tooltip";

interface Props {
  id: string;
  message: string;
}

// Ink tooltip: small, flat, soft neutral shadow.
const ToolTip: FC<PropsWithChildren<Props>> = ({ id, message, children }) => {
  return (
    <div>
      <div data-tooltip-content={message} data-tooltip-id={id}>
        {children || "i"}
      </div>
      <ReactToolTip
        id={id}
        noArrow
        opacity={1}
        className="!z-[1200] !rounded-[7px] !bg-inverse !px-[9px] !py-1.5 !text-xs !font-medium !text-on-inverse !shadow-lift"
      />
    </div>
  );
};

export default ToolTip;
