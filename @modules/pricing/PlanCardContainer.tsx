import React, { FC, useState, useEffect } from "react";
import { PlanModel } from "@/models/plan.model";
import Cookies from "js-cookie";
import { accessToken } from "@/constants";
import dynamic from "next/dynamic";

const PlanCard = dynamic(
  () => import("./PlanCard").then((comp) => comp.default),
  { ssr: false, loading: () => <></> }
);

interface Props {
  plans: PlanModel[];
}

const PlanCardContainer: FC<Props> = ({ plans }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = Cookies.get(accessToken);

    if (isLoggedIn) {
      setIsUserLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex justify-center items-center gap-x-8 gap-y-5 py-20 max-md:flex-wrap">
      {plans.map((plan, idx) => {
        return <PlanCard {...plan} isLoggedIn={isUserLoggedIn} key={idx} />;
      })}
    </div>
  );
};

export default PlanCardContainer;
