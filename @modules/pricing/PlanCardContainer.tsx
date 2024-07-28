import React, { FC } from "react";
import PlanCard from "./PlanCard";
import { PlanModel } from "@/models/plan.model";

interface Props {
  plans: PlanModel[];
}

const PlanCardContainer: FC<Props> = ({ plans }) => {
  return (
    <div className="flex justify-center items-center gap-x-8 gap-y-5 py-20 max-md:flex-wrap">
      {plans.map((plan, idx) => {
        return <PlanCard {...plan} key={idx} />;
      })}
    </div>
  );
};

export default PlanCardContainer;
