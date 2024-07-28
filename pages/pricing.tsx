import PlanContainer from "@/@modules/pricing/PlanContainer";
import AppHead from "@/@shared/components/AppHead";
import Footer from "@/@shared/components/Footer";
import Navbar from "@/@shared/components/Navbar";
import { NextPage } from "next";
import React from "react";

const Pricing: NextPage = () => {
  return (
    <>
      <AppHead />
      <Navbar />
      <PlanContainer />
      <Footer />
    </>
  );
};

export default Pricing;
