import React, { FC, useEffect, useState } from "react";
import RecentDocumentItem, { IRecentDocumentItem } from "./RecentDocumentItem";
import cn from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";

interface Props {
  data: IRecentDocumentItem[];
  forceRender?: boolean | null
}

const RecentDocumentContainer: FC<Props> = ({ data, forceRender = null }) => {
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );

  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isOpen) {
      // Delay rendering when opening
      timeout = setTimeout(() => {
        setShouldRender(true);
      }, 300);
    } else {
      // Instantly hide when closing
      setShouldRender(false);
    }

    return () => clearTimeout(timeout);
  }, [isOpen]);

  return (
    <div
      className={cn(`w-full transition-all`, {
        "opacity-100 scale-x-100": forceRender ?? shouldRender,
        "opacity-0 scale-x-0": forceRender ?? !shouldRender,
      })}
    >
      <p className="font-semibold mb-5 text-white text-sm">Recent Documents</p>

      <div className="flex flex-col gap-1">
        {data.map((d, idx) => {
          return <RecentDocumentItem {...d} key={idx} />;
        })}
      </div>
    </div>
  );
};

export default RecentDocumentContainer;
