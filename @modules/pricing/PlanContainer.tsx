import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import PlanCardContainer from "./PlanCardContainer";
import { useGetPlansQuery } from "@/api-services/plans.service";

const PlanContainer: FC = () => {
  const { data: plans } = useGetPlansQuery("");

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
          <PlanCardContainer plans={plans ?? []} />
        </Container>
      </div>
    </section>
  );
};

export default PlanContainer;
