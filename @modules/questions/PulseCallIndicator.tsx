import React, { FC } from "react";

/* Small live dot shown beside "Test in progress..." during the call. */
const PulseCallIndicator: FC = () => {
  return (
    <span
      aria-hidden
      className="w-1.5 h-1.5 shrink-0 rounded-full bg-success shadow-[0_0_0_3px_var(--success-bg)]"
    />
  );
};

export default PulseCallIndicator;
