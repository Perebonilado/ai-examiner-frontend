import React, { FC, PropsWithChildren, ReactNode } from "react";

/* Two-column account section: title (and explanation) on the left, content on the right.
   Phone: stacked. Sections are separated by hairlines. */

interface Props {
  title: string;
  id: string;
  description?: ReactNode;
  className?: string;
}

const AccountSection: FC<PropsWithChildren<Props>> = ({
  title,
  id,
  description,
  className = "md:grid-cols-[240px_minmax(0,1fr)] md:gap-x-12",
  children,
}) => {
  return (
    <section
      aria-labelledby={id}
      className={`grid grid-cols-1 gap-3 border-b border-line py-[26px] last:border-b-0 last:pb-0 md:gap-y-3.5 md:py-9 ${className}`}
    >
      <div>
        <h2 id={id} className="text-lg font-bold leading-[1.3] tracking-[-0.015em] text-ink">
          {title}
        </h2>
        {description}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
};

export default AccountSection;
