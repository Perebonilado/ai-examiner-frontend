import Container from "@/@shared/ui/Container";
import Link from "next/link";
import React, { FC } from "react";

const JumbotronV2: FC = () => {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center text-center py-[120px]">
        <p className="text-base sm:text-lg mb-8 md:text-xl lg:text-xl font-normal">
          <span className="italic">Built by</span>{" "}
          <span className="text-[#9333EA]">Medical students</span>
        </p>

        <p className=" text-5xl font-extrabold leading-[50px] w-full max-w-[752px]">
          Turn your study materials into{" "}
          <span className="bg-gradient-to-r from-[#9333EA] to-[#F89AEE] bg-clip-text text-transparent">
            practice tests
          </span>{" "}
          in seconds
        </p>

        <p className="mt-5 text-base sm:text-lg md:text-xl font-light w-full max-w-[752px]">
          Simply upload your study material and AI Examiner will generate the
          perfect challenging <span>questions for you.</span>
        </p>

        <div className="inline-block mt-20 mb-40 rounded-[50px] bg-gradient-to-r from-[#9333EA] to-[#F89AEE] p-[4px]">
          <Link href={"/auth/login"}>
            <button className="py-5 px-12 text-sm bg-[#2F004F] text-white rounded-[50px]">
              Try for free
            </button>
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default JumbotronV2;
