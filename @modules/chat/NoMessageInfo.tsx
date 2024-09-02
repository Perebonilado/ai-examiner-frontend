import React, { FC } from "react";

interface Props {

}

const NoMessageInfo: FC = () => {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <p>Hi! I am your personal study buddy and I can help you:</p>
      <ul>
        <li>Summarize topics</li>
        <li>Simplify concepts</li>
        <li>Answer test/examination questions</li>
      </ul>
    </div>
  );
};

export default NoMessageInfo;
