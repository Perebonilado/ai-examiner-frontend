import React, { FC, ReactNode } from "react";

interface Props {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
}

/* One summary row: muted label with icon on the left, value on the right. */
const TestSummaryItem: FC<Props> = ({ title, value, icon }) => {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-line last:border-b-0">
      <dt className="flex items-center gap-2.5 text-sm text-subtle">
        {icon && (
          <span
            className="text-faint [&_svg]:w-4 [&_svg]:h-4"
            aria-hidden
          >
            {icon}
          </span>
        )}
        {title}
      </dt>
      <dd className="ml-auto text-sm font-semibold text-ink text-right tabular-nums">
        {value}
      </dd>
    </div>
  );
};

export default TestSummaryItem;
