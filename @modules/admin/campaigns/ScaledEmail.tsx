import React, { FC } from "react";
import cn from "classnames";
import EmailFrame from "./EmailFrame";
import { useElementWidth } from "./useElementWidth";

/** The email shrunk to fit a card (at most `maxScale`), clipped to `height`. */
const ScaledEmail: FC<{ html: string | null; height?: number; maxScale?: number; className?: string }> = ({
  html,
  height = 380,
  maxScale = 0.62,
  className,
}) => {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const scale = width ? Math.min(maxScale, width / 600) : maxScale;

  return (
    <div
      ref={ref}
      style={{ height }}
      className={cn("relative overflow-hidden rounded-[10px] bg-[#f4f4f6] dark:bg-sunken", className)}
    >
      {html ? (
        <div className="pointer-events-none flex justify-center" aria-hidden="true">
          <EmailFrame html={html} width={600} scale={scale} title="Email preview, small" decorative />
        </div>
      ) : null}
    </div>
  );
};

export default ScaledEmail;
