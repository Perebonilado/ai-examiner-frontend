import React, { FC, useState, useEffect } from "react";
import { PlanModel } from "@/models/plan.model";
import Cookies from "js-cookie";
import { accessToken } from "@/constants";
import dynamic from "next/dynamic";
import PlanIntervalPill from "./PlanIntervalPill";
import { PlanInterval } from "@/dto/plan.dto";

const PlanCard = dynamic(
  () => import("./PlanCard").then((comp) => comp.default),
  { ssr: false, loading: () => <></> }
);

interface Props {
  plans: PlanModel[];
}

const PlanCardContainer: FC<Props> = ({ plans }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentInterval, setCurrentInterval] =
    useState<PlanInterval>("monthly");

  useEffect(() => {
    const isLoggedIn = Cookies.get(accessToken);

    if (isLoggedIn) {
      setIsUserLoggedIn(true);
    }
  }, []);

  const filterPlansByInterval = (plans: PlanModel[]) => {
    return plans.filter((p)=>p.interval === currentInterval)
  }

  return (
    <div className="-mt-40">
      <div className="mx-auto border border-gray-300 bg-[#F4F4F4] w-fit mb-8 rounded-full">
        <PlanIntervalPill
          isActive={currentInterval === 'monthly'}
          title="monthly"
          handleClick={setCurrentInterval}
        />
        <PlanIntervalPill
          isActive={currentInterval === 'quarterly'}
          title="quarterly"
          handleClick={setCurrentInterval}
        />
      </div>
      <div className="flex justify-center items-center gap-x-8 gap-y-5 pb-20 max-lg:flex-wrap">
        {filterPlansByInterval(plans).map((plan, idx) => {
          return <PlanCard {...plan} isLoggedIn={isUserLoggedIn} key={idx} />;
        })}
      </div>
    </div>
  );
};

export default PlanCardContainer;
