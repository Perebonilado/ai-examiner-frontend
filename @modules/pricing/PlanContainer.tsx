import Container from "@/@shared/ui/Container";
import React, { FC, useEffect } from "react";
import PlanCardContainer from "./PlanCardContainer";
import { PlanModel } from "@/models/plan.model";
import { useGetPlansQuery } from "@/api-services/plans.service";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";

const PlanContainer: FC = () => {
  const { data: plans, isLoading, error, refetch } = useGetPlansQuery('')

  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

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

