import React, { FC } from "react";
import AltTabItem, { IAltTabItem } from "./AltTabItem";

interface Props {
  data: Omit<IAltTabItem, "handleClick">[];
  handleClick: (tab: string) => void;
}

const AltTabContainer: FC<Props> = ({ data, handleClick }) => {
  return (
    <div className="mx-auto w-fit rounded-md flex overflow-hidden">
      {data.map((d, idx) => {
        return (
          <AltTabItem
            {...d}
            handleClick={() => handleClick(d.title)}
            key={idx}
          />
        );
      })}
    </div>
  );
};

export default AltTabContainer;
