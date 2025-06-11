import Container from "@/@shared/ui/Container";
import React, { FC, useEffect, useState } from "react";
import PlanCardContainer from "./PlanCardContainer";
import { useGetPlansQuery } from "@/api-services/plans.service";
import { useGetUserIpInfoQuery } from "@/api-services/ip.service";
import { PlanModel } from "@/models/plan.model";
import { AppLoader } from "@/@shared/components/AppLoader";

const PlanContainer: FC = () => {
  const { data: ipDetails, isError: isIpDetailsError } =
    useGetUserIpInfoQuery("");
  const { data: plans, isLoading: plansLoading } = useGetPlansQuery("");
  const [plansToDisplay, setPlansToDisplay] = useState<PlanModel[]>();

  useEffect(() => {
    if (ipDetails && plans) {
      const plansToShow = getPlansToDisplay();

      if (plansToShow) {
        const freePlan = {
          costPerMonth: 0,
          currency: plansToShow[0].currency,
          offers: [
            { title: "Multiple choice questions", isAvailable: true },
            { title: "Flashcards", isAvailable: true },
            { title: "Topic selection", isAvailable: true },
            { title: "AI Discussions", isAvailable: true },
          ],
          type: "Free",
          planId: 4098888376,
          region: "Africa" as const,
          interval: "monthly" as const
        };
        setPlansToDisplay([freePlan, ...plansToShow]);
      }
    }
  }, [ipDetails, plans]);

  useEffect(() => {
    if (isIpDetailsError && plans) {
      const plansToShow = getPlansToDisplay();

      if (plansToShow) {
        const freePlan = {
          costPerMonth: 0,
          currency: plansToShow[0].currency,
          offers: [
            { title: "Multiple choice questions", isAvailable: true },
            { title: "Flashcards", isAvailable: true },
            { title: "Topic selection", isAvailable: true },
            { title: "AI Discussions", isAvailable: true },
          ],
          type: "Free",
          planId: 4098888376,
          region: "Africa" as const,
          interval: "monthly" as const
        };
        setPlansToDisplay([freePlan, ...plansToShow]);
      }
    }
  }, [isIpDetailsError, plans]);

  const getPlansToDisplay = () => {
    const nairaCurrencyCode = "NGN";

    if (plans && ipDetails) {
      if (ipDetails && ipDetails.timezone?.toLowerCase().includes("africa")) {
        if (ipDetails.country?.toLowerCase() === "ng") {
          return plans.filter(
            (plan) =>
              plan.region === "Africa" && plan.currency === nairaCurrencyCode
          );
        }

        return plans.filter(
          (plan) =>
            plan.region === "Africa" && plan.currency !== nairaCurrencyCode
        );
      }

      if (ipDetails && !ipDetails.timezone?.toLowerCase().includes("africa")) {
        return plans.filter((plan) => plan.region !== "Africa");
      }
    }

    return plans?.filter(
      (p) => p.region === "Africa" && p.currency === nairaCurrencyCode
    );
  };

  return (
    <section className="bg-[#FAFAFA]">
      <div className="min-h-[80vh] pb-20">
        <div className="pt-20 pb-56 bg-[#f7f4ff]">
          <Container>
            <h1 className="text-center text-3xl font-bold">
              AI Examiner Plans
            </h1>
            <p className="text-center text-base mt-4">
              Start generating questions to strengthen your knowledge{" "}
            </p>
          </Container>
        </div>

        <Container>
          
          {plans && !plansLoading && <PlanCardContainer plans={plansToDisplay ?? []} />}
          {!plans && plansLoading && <AppLoader />}
        </Container>
      </div>
    </section>
  );
};

export default PlanContainer;
