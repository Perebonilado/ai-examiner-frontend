import PlanContainer from "@/@modules/pricing/PlanContainer";
import ReviewsContainer from "@/@modules/pricing/ReviewsContainer";
import AppHead from "@/@shared/components/AppHead";
import WebLayout from "@/layouts/WebLayout";
import { NextPage } from "next";
import React from "react";

const Pricing: NextPage = () => {
  return (
    <WebLayout backgroundColor="#f7f4ff">
      <AppHead />
      <PlanContainer />
      <ReviewsContainer />
    </WebLayout>
  );
};

export default Pricing;
