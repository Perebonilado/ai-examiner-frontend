import { PricingModel } from "@/models/pricing.model";
import React, { FC } from "react";
import PricingCard from "./PricingCard";

interface Props {
  plans: PricingModel[];
}

const PricingCardContainer: FC<Props> = ({ plans }) => {
  return (
    <div className="flex justify-center items-center gap-x-8 gap-y-5 py-20 max-md:flex-wrap">
      {plans.map((plan, idx) => {
        return <PricingCard {...plan} key={idx} />;
      })}
    </div>
  );
};

export default PricingCardContainer;
