import React, { FC, PropsWithChildren } from "react";
import { Tooltip as ReactToolTip } from "react-tooltip";

interface Props {
  id: string;
  message: string;
}

const ToolTip: FC<PropsWithChildren<Props>> = ({ id, message, children }) => {
  return (
    <div>
      <div
        data-tooltip-content={message}
        data-tooltip-id={id}
      >
        {children || 'i'}
      </div>
      <ReactToolTip id={id} />
    </div>
  );
};

export default ToolTip;
