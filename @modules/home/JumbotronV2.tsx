import Container from "@/@shared/ui/Container";
import React, { FC } from "react";

const JumbotronV2: FC = () => {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center text-center py-[120px]">
        <p className="text-base sm:text-lg mb-8 md:text-xl lg:text-2xl font-normal">
          <span className="italic">Built by</span>{" "}
          <span className="text-[#9333EA]">Medical students</span>
        </p>

        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
          Turn your study materials
        </p>

        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
          into{" "}
          <span className="bg-gradient-to-r from-[#9333EA] to-[#F89AEE] bg-clip-text text-transparent">
            practice tests
          </span>{" "}
          in seconds
        </p>

        <p className="mt-10 text-base sm:text-lg md:text-xl lg:text-2xl font-normal">
          Simply upload your study material and AI Examiner will generate the
          perfect challenging <span className="block">questions for you.</span>
        </p>

        <div className="inline-block mt-20 rounded-[50px] bg-gradient-to-r from-[#9333EA] to-[#F89AEE] p-[2px]">
          <button className="w-[263px] h-[58px] bg-[#2F004F] text-white rounded-[50px]">
            Generate test
          </button>
        </div>
      </div>
    </Container>
  );
};

export default JumbotronV2;
