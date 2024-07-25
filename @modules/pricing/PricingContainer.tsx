import Container from "@/@shared/ui/Container";
import { PricingModel } from "@/models/pricing.model";
import React, { FC } from "react";
import PricingCardContainer from "./PricingCardContainer";

const PricingContainer: FC = () => {
  return (
    <section className="bg-[#FAFAFA]">
      <Container>
        <div className="min-h-[80vh] py-20">
          <h1 className="text-center text-3xl font-bold">AI Examiner Plans</h1>
          <p className="text-center text-base">
            Start generating questions to strengthen your knowledge{" "}
          </p>

          <PricingCardContainer plans={mock} />
        </div>
      </Container>
    </section>
  );
};

export default PricingContainer;

const mock: PricingModel[] = [
  {
    type: "Free",
    costPerMonth: 9.99,
    currency: "USD",
    offers: ["Access to basic features", "Email support"],
  },
  {
    type: "Standard",
    costPerMonth: 19.99,
    currency: "USD",
    offers: [
      "Access to all features",
      "Priority email support",
      "Monthly reports",
    ],
  },
  {
    type: "Premium",
    costPerMonth: 49.99,
    currency: "USD",
    offers: [
      "Customizable features",
      "Dedicated account manager",
      "24/7 support",
      "Quarterly business reviews",
    ],
  },
];
