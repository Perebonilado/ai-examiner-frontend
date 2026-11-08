import React, { FC } from "react";
import AltTabItem, { IAltTabItem } from "./AltTabItem";

interface Props {
  data: Omit<IAltTabItem, "handleClick">[];
  handleClick: (tab: string) => void;
}

const AltTabContainer: FC<Props> = ({ data, handleClick }) => {
  return (
    <div className="mx-auto w-fit rounded-[10px] flex gap-0.5 p-[3px] bg-sunken">
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
