import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import StatisticItem from "./StatisticItem";
import ReviewItem from "./ReviewItem";
import Button from "@/@shared/ui/Button";
import ArrowDiagonalRightIcon from "@/icons/ArrowDiagonalRightIcon";
import Link from "next/link";
import StatisticsContainer from "./StatisticsContainer";

const ReviewsContainer: FC = () => {
  return (
    <div className="bg-[#FAFAFA]">
      <Container>
        <section className="pb-28">
          <h3 className="text-4xl font-bold text-[#2F004F] text-center">
            Trusted by students all over the world
          </h3>
          <p className="mt-6 text-center w-full max-w-[600px] mx-auto">
            Thousands of students and professionals are beginning to rethink how
            they learn and prepare for their tests, exams, interviews, dream
            jobs and so much more!
          </p>

          <div className="mt-10">
            <StatisticsContainer />
          </div>

          <div className="mt-20 flex items-center justify-between w-full max-w-[1100px] max-md:justify-center gap-8 flex-wrap mx-auto">
            <ReviewItem
              review="Tried it and just subscribed to premium. This is a lifesaver. Thank you"
              fullname="Omotola"
            />
            <ReviewItem
              review="This is innovation at its finest. Medical students know how valuable this site is. Thank you!"
              fullname="Aikhenomian Paul"
            />
            <ReviewItem
              review="I just uploaded an ECG textbook and asked it to generate flash cards and it did perfectly. It can even read the questions for you."
              fullname="Orobo, MD"
            />
          </div>

          <div className="mt-24 flex flex-col items-center justify-center gap-6">
            <h3 className="text-[#2F004F] text-3xl font-bold text-center">
              Start free, upgrade anytime
            </h3>

            <Link href={"/new-document"}>
              <Button
                title="Get started"
                size="large"
                endicon={<ArrowDiagonalRightIcon fill="#FFFFFF" />}
              />
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default ReviewsContainer;
