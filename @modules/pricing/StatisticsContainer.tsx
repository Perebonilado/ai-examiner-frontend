import React, { FC } from "react";
import StatisticItem from "./StatisticItem";

const StatisticsContainer: FC = () => {
  return (
    <div className="flex justify-between max-md:justify-center max-md:flex-col gap-y-14 gap-6 flex-wrap w-full max-w-[900px] mx-auto">
      <StatisticItem count={6000} title="users" />
      <StatisticItem count={100000} title="questions generated" />
      <StatisticItem count={5000} title="grades improved" />
    </div>
  );
};

export default StatisticsContainer;
