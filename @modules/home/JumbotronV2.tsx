import Container from "@/@shared/ui/Container";
import Link from "next/link";
import React, { FC } from "react";

interface Props {
  handleTryForFree: () => void;
}

const JumbotronV2: FC<Props> = ({ handleTryForFree }) => {
  const textGradient =
    "bg-gradient-to-r from-[#9333EA] to-[#F89AEE] bg-clip-text text-transparent";
  return (
    <Container>
      <div className="flex flex-col items-center justify-center text-center py-[120px]">
        <p className="text-base sm:text-lg mb-8 md:text-xl lg:text-xl font-normal">
          <span className="italic">Built by</span>{" "}
          <span className="text-[#9333EA]">Medical students</span>
        </p>

        <p className=" text-5xl font-extrabold leading-[50px] w-full max-w-[752px]">
          Instantly turn your study
          <br />
          materials into <span className={textGradient}>practice</span>
          <br />
          <span className={textGradient}>tests & easy reads</span>
        </p>

        <p className="mt-5 text-base sm:text-lg md:text-xl font-light w-full max-w-[752px]">
          Upload, read, and generate customizable practice tests to master any
          subject.
        </p>

        <div className="inline-block mt-20 mb-40 rounded-[50px] bg-gradient-to-r from-[#9333EA] to-[#F89AEE] p-[4px]">
          <button
            className="py-5 px-12 text-sm bg-[#2F004F] text-white rounded-[50px]"
            onClick={handleTryForFree}
          >
            Try for free
          </button>
        </div>
      </div>
    </Container>
  );
};

export default JumbotronV2;
