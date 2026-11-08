import React, { FC } from "react";
import cn from "classnames";

interface Props {
  count?: number;
}

const Bar: FC<{ className: string }> = ({ className }) => (
  <span className={cn("block rounded-md bg-sunken", className)} />
);

/**
 * Stand-ins for the test cards while they load: the same size and layout as ViewQuestionCard,
 * so the page doesn't jump when the real cards arrive.
 */
const TestCardsSkeleton: FC<Props> = ({ count = 4 }) => {
  return (
    <section
      role="status"
      aria-label="Loading tests"
      className="flex items-start flex-wrap gap-y-12 gap-10 mb-6"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="w-full max-w-[380px] min-h-[180px] flex flex-col gap-4 py-4 px-4 rounded-xl border border-gray-300 bg-white drop-shadow-sm animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${i * 140}ms` }}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between py-1 min-h-[32px]">
              <Bar className="h-4 w-[46%]" />
              <Bar className="h-[22px] w-[74px] rounded-full" />
            </div>
            <Bar className="mt-2 h-3.5 w-[32%]" />
            <div className="flex items-center mt-4 min-h-[30px]">
              <Bar className="h-3 w-[58%]" />
            </div>
          </div>
          <div className="border-t pt-4 border-t-gray-300 flex items-center justify-between min-h-[46px]">
            <Bar className="h-3.5 w-[64px]" />
            <div className="flex items-center gap-4">
              <Bar className="h-4 w-4" />
              <Bar className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default TestCardsSkeleton;
