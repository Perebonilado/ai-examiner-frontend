import { PlanModel } from "@/models/plan.model";
import React, { FC, useEffect, useState } from "react";
import NonAfricanPlanCard from "./NonAfricanPlanCard";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";

interface Props {
  plans?: PlanModel[];
  currentDivision: "monthly" | "annually";
}

const NonAfricanPlansContainer: FC<Props> = ({ currentDivision, plans }) => {
  const [plansToShow, setPlansToShow] = useState<PlanModel[]>();
  const [freePlan, setFreePlan] = useState<PlanModel | null>(null);

  const { isLoggedIn } = useIsLoggedIn();

  useEffect(() => {
    if (plans?.length) {
      const plansByDivison = plans.filter((plan) => {
        if (currentDivision.toLowerCase() === "monthly") {
          return plan.interval === "monthly";
        }

        return plan.interval === "annually";
      });

      setPlansToShow(plansByDivison);

      const freePlan_ = {
        costPerMonth: 0,
        currency: "USD",
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
      } as PlanModel;

      if (currentDivision.toLowerCase() === "monthly") {
        setFreePlan(freePlan_);
      } else {
        setFreePlan(null);
      }
    }
  }, [plans, currentDivision]);

  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-[800px] mx-auto max-md:flex-col">
      {freePlan && <NonAfricanPlanCard {...freePlan} isLoggedIn={isLoggedIn} />}

      {plansToShow?.map((pl, idx) => {
        return <NonAfricanPlanCard {...pl} isLoggedIn={isLoggedIn} key={idx} />;
      })}
    </div>
  );
};

export default NonAfricanPlansContainer;
