import React, { FC } from "react";
import RecentDocumentItem, { IRecentDocumentItem } from "./RecentDocumentItem";

interface Props {
  data: IRecentDocumentItem[];
  /** Kept for older callers; the list now simply renders when it is mounted. */
  forceRender?: boolean | null;
}

const RecentDocumentContainer: FC<Props> = ({ data }) => {
  if (!data.length) return null;

  return (
    <section className="mt-[22px] w-full" aria-labelledby="recent-docs-title">
      <h2
        id="recent-docs-title"
        className="px-2.5 pb-1.5 text-xs font-semibold tracking-normal text-muted"
      >
        Recent documents
      </h2>
      <div className="flex flex-col gap-0.5">
        {data.map((d) => (
          <RecentDocumentItem {...d} key={d.link} />
        ))}
      </div>
    </section>
  );
};

export default RecentDocumentContainer;
