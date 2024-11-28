import Container from "@/@shared/ui/Container";
import React, { FC, useEffect, useState } from "react";
import PlanCardContainer from "./PlanCardContainer";
import { useGetPlansQuery } from "@/api-services/plans.service";
import { useGetUserIpInfoQuery } from "@/api-services/ip.service";
import { PlanModel } from "@/models/plan.model";

const PlanContainer: FC = () => {
  const { data: ipDetails, isError: isIpDetailsError } = useGetUserIpInfoQuery("");
  const { data: plans } = useGetPlansQuery("");
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
            { title: "AI Discussions", isAvailable: false },
          ],
          type: "Free",
          planId: 4098888376,
        };
        setPlansToDisplay([freePlan, ...plansToShow]);
      }
    }
  }, [ipDetails, plans]);

  useEffect(()=>{

    if(isIpDetailsError && plans) {
      const plansToShow = getPlansToDisplay();

      if (plansToShow) {
        const freePlan = {
          costPerMonth: 0,
          currency: plansToShow[0].currency,
          offers: [
            { title: "Multiple choice questions", isAvailable: true },
            { title: "Flashcards", isAvailable: true },
            { title: "Topic selection", isAvailable: true },
            { title: "AI Discussions", isAvailable: false },
          ],
          type: "Free",
          planId: 4098888376,
        };
        setPlansToDisplay([freePlan, ...plansToShow]);
      }
    }

  }, [isIpDetailsError, plans])

  const getPlansToDisplay = () => {
    const nairaCurrencyCode = "NGN";
    const usdCurrencyCode = "USD";
    if (plans && ipDetails) {
      let isUsersCountryNigeria = true;
      let isUsersContinentAfrica = true;

      if (ipDetails && ipDetails.country?.toLowerCase() !== "ng") {
        isUsersCountryNigeria = false;
      }

      if (ipDetails && !ipDetails.timezone?.toLowerCase().includes("africa")) {
        isUsersContinentAfrica = false;
      }

      if (isUsersContinentAfrica) {
        if (isUsersCountryNigeria) {
          return plans.filter((plan) => plan.currency === nairaCurrencyCode);
        } else {
          return plans.filter((plan) => {
            const africanRegionalPlans =
              (
                plan.offers as {
                  title: string;
                  isAvailable: boolean;
                  continent?: string;
                }[]
              ).find((d) => d?.continent === "Africa") &&
              plan.currency === usdCurrencyCode;

            return africanRegionalPlans ? true : false;
          });
        }
      } else {
        return plans.filter((plan) => {
          const northAmericanRegionalPlans = (
            plan.offers as {
              title: string;
              isAvailable: boolean;
              continent?: string;
            }[]
          ).find((d) => d?.continent === "North America");

          return northAmericanRegionalPlans ? true : false;
        });
      }
    } else if (plans && !ipDetails) {
      return plans.filter((plan) => plan.currency === nairaCurrencyCode);
    }
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
          <PlanCardContainer plans={plansToDisplay ?? []} />
        </Container>
      </div>
    </section>
  );
};

export default PlanContainer;
