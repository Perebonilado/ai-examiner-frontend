import React, { FC } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  percentagePassed: number;
  percentageFailed: number;
}

const TopicPerformancePieChart: FC<Props> = ({
  percentageFailed,
  percentagePassed,
}) => {
  const data = {
    labels: [
      `Percentage of Topics Passed ${percentagePassed}%`,
      `Percentage of Topics Failed ${percentageFailed}%`,
    ],
    datasets: [
      {
        //   passed | failed,
        data: [percentagePassed, percentageFailed],
        backgroundColor: ["#DFF9E1", "#FADCDC"],
        borderColor: ["#36CE10", "#EE6161"],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="w-full max-w-[500px] mx-auto relative flex  justify-center cursor-pointer">
      <Doughnut data={data} />
    </div>
  );
};

export default TopicPerformancePieChart;
