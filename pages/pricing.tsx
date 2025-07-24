import PlanContainer from "@/@modules/pricing/PlanContainer";
import ReviewsContainer from "@/@modules/pricing/ReviewsContainer";
import PlanContainerV2 from "@/@modules/pricing/v2/PlanContainerV2";
import AppHead from "@/@shared/components/AppHead";
import WebLayout from "@/layouts/WebLayout";
import { NextPage } from "next";
import React from "react";

const Pricing: NextPage = () => {
  return (
    <WebLayout backgroundColor="#fffff" paddingTopMd={false}>
      <AppHead />
      <PlanContainerV2 />
      {/* <PlanContainer /> */}
      <ReviewsContainer />
    </WebLayout>
  );
};

export default Pricing;
