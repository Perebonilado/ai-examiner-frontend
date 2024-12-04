import React, { FC } from "react";
import cn from "classnames";

interface Props {
  isActive: boolean;
  title: string;
}

const Pill: FC<Props> = ({ isActive, title }) => {
  const rootClassName = cn(
    `py-2 px-9 rounded-full text-sm cursor-pointer w-fit`,
    {
      ["bg-[#F2E1FF] w-fit"]: isActive,
      ['border border-gray-200']: !isActive
    }
  );
  return (
    <div className={rootClassName}>
      <p>{title}</p>
    </div>
  );
};

export default Pill;
