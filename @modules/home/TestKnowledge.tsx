import Container from "@/@shared/ui/Container";
import Image from "next/image";
import React, { FC } from "react";

const TestKnowledge: FC = () => {
  return (
    <section className="bg-[#FAFAFA] py-20">
      <Container>
        <h3 className="text-center text-3xl font-bold text-[#360B58]">
          Test your knowledge and get graded
        </h3>
        <p className="w-full text-center max-w-[680px] mx-auto mt-6">
          AI Examiner offers a dynamic approach to reinforcing your
          understanding of key concepts. With instant feedback and detailed
          progress tracking, you’ll gain valuable insights into your learning
          journey.
        </p>

        <div
          className="relative h-[500px] w-full mt-16 max-md:mt-4"
          style={{
            background:
              "url(/home/jumbotron-bg.png) no-repeat center center / 40% auto",
          }}
        >
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="50% 50%"
            src={"/home/test-knowledge.png"}
            alt={"Test your knowledge"}
          />
        </div>
      </Container>
    </section>
  );
};

export default TestKnowledge;
