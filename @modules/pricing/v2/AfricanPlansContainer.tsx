import { PlanModel } from "@/models/plan.model";
import React, { FC, useEffect, useState } from "react";
import AfricanPlanCard from "./AfricanPlanCard";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";

interface Props {
  plans?: PlanModel[];
  userIsNigerian: boolean;
  currentDivision: "monthly" | "quarterly";
}

const AfricanPlansContainer: FC<Props> = ({
  currentDivision,
  userIsNigerian,
  plans,
}) => {
  const [plansToShow, setPlansToShow] = useState<PlanModel[]>();
  const [freePlan, setFreePlan] = useState<PlanModel>();
  const nairaCurrencyCode = "NGN";

  useEffect(() => {
    if (plans?.length) {
      const planByRegion = plans.filter((plan) => {
        if (userIsNigerian) {
          return plan.currency === nairaCurrencyCode;
        }
        return plan.currency !== nairaCurrencyCode;
      });

      const planByDivision = planByRegion.filter((plan) => {
        if (currentDivision.toLowerCase() === "monthly") {
          return plan.interval === "monthly";
        }
        return plan.interval === "quarterly";
      });

      if (planByDivision.length) {
        setPlansToShow(planByDivision);

        const freePlan_ = {
          costPerMonth: 0,
          currency: planByDivision[0].currency,
          offers: [
            { title: "Multiple choice questions", isAvailable: true },
            { title: "Flashcards", isAvailable: true },
            { title: "Topic selection", isAvailable: true },
            { title: "AI Discussions", isAvailable: true },
          ],
          type: "Free",
          planId: 4098888376,
          region: "Africa" as const,
          interval: "monthly" as const,
        };

        setFreePlan(freePlan_);
      }
    }
  }, [plans, userIsNigerian, currentDivision]);

  const { isLoggedIn } = useIsLoggedIn();

  return (
    <div className="flex items-center justify-center pb-4 max-md:flex-col-reverse max-md:gap-8">
      {freePlan && <AfricanPlanCard {...freePlan} isLoggedIn={isLoggedIn} />}

      <div className="max-md:flex-col border max-md:shadow-none max-md:border-none max-md:gap-8 border-[#9333EA] rounded-xl flex items-center min-w-fit shadow-2xl">
        {plansToShow &&
          plansToShow.map((pl) => {
            return <AfricanPlanCard {...pl} isLoggedIn={isLoggedIn} />;
          })}
      </div>
    </div>
  );
};

export default AfricanPlansContainer;
