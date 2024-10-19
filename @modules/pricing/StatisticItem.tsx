import React, { FC } from "react";
import CountUp from 'react-countup';

interface Props {
  title: string;
  count: number;
}

const StatisticItem: FC<Props> = ({ count, title }) => {
  return (
    <div className="flex flex-col gap-2 text-center items-center justify-center">
      <h3 className="text-5xl font-bold text-[#9A67E2]">
        <CountUp end={count} enableScrollSpy={true} useEasing={true}/>+
      </h3>
      <p>{title}</p>
    </div>
  );
};

export default StatisticItem;
