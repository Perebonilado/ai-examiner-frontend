import React, { FC } from "react";
import cn from "classnames";

interface Props {
  userResponse: string;
  grade: "pass" | "fail";
  score: number;
}

const VivaUserResponse: FC<Props> = ({ grade, userResponse, score }) => {
  return (
    <section
      aria-label="Summary of your response"
      className="rounded-xl bg-well px-4 pt-3.5 pb-4 max-md:px-3.5 max-md:pt-3 max-md:pb-3.5"
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-[13px] font-bold text-ink">
          Your response
          <span aria-hidden className="inline-block w-px h-3 bg-control" />
          <span className="font-semibold text-muted">Summary</span>
        </h4>
        <span
          aria-label={`Score: ${score} out of 10`}
          className={cn(
            "inline-flex items-baseline gap-px px-3 py-1.5 rounded-[10px] text-2xl font-extrabold leading-none tracking-[-0.03em] tabular-nums",
            {
              "bg-success-bg text-success shadow-[inset_0_0_0_1px_var(--success-line)]":
                grade === "pass",
              "bg-danger-bg text-danger shadow-[inset_0_0_0_1px_var(--danger-line)]":
                grade === "fail",
            }
          )}
        >
          {score}
          <small className="text-sm font-bold tracking-normal opacity-70">
            /10
          </small>
        </span>
      </div>
      <p className="mt-2 text-sm leading-[1.65] text-body max-w-[68ch]">
        {userResponse}
      </p>
    </section>
  );
};

export default VivaUserResponse;
