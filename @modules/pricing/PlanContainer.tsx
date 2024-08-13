import Container from "@/@shared/ui/Container";
import React, { FC, } from "react";
import PlanCardContainer from "./PlanCardContainer";
import { useGetPlansQuery } from "@/api-services/plans.service";
import Cookies from "js-cookie";
import { accessToken } from "@/constants";

const PlanContainer: FC = () => {
  const { data: plans } = useGetPlansQuery('')

  return (
    <section className="bg-[#FAFAFA]">
      <Container>
        <div className="min-h-[80vh] py-20">
          <h1 className="text-center text-3xl font-bold">AI Examiner Plans</h1>
          <p className="text-center text-base mt-4">
            Start generating questions to strengthen your knowledge{" "}
          </p>

          <PlanCardContainer plans={plans ?? []} />
        </div>
      </Container>
    </section>
  );
};

export default PlanContainer;

