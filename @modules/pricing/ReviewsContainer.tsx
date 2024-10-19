import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import StatisticItem from "./StatisticItem";

const ReviewsContainer: FC = () => {
  return (
    <Container>
      <section className="pb-28">
        <h3 className="text-4xl font-bold text-[#2F004F] text-center">
          Trusted by students all over the world
        </h3>
        <p className="mt-6 text-center w-full max-w-[600px] mx-auto">
          Thousands of students and professionals are beginning to rethink how
          they learn and prepare for their tests, exams, interviews, dream jobs
          and so much more!
        </p>

        <div className="flex justify-between max-md:justify-center max-md:flex-col gap-y-14 gap-6 flex-wrap w-full max-w-[900px] mx-auto mt-10">
          <StatisticItem count={6000} title="users" />
          <StatisticItem count={100000} title="questions generated" />
          <StatisticItem count={5000} title="grades improved" />
        </div>
      </section>
    </Container>
  );
};

export default ReviewsContainer;
