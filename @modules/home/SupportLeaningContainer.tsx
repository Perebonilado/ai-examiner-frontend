import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import SupportLearningItem, {
  ISupportLearningItem,
} from "./SupportLearningItem";
import Button from "@/@shared/ui/Button";
import ArrowDiagonalRightIcon from "@/icons/ArrowDiagonalRightIcon";
import Link from "next/link";

interface Props {
  data: ISupportLearningItem[];
  handleTryForFree: () => void;
}

const SupportLeaningContainer: FC<Props> = ({ data, handleTryForFree }) => {
  return (
    <Container>
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mt-24 mb-16">
        <div className="flex-1">
          <h2 className="text-5xl font-extrabold leading-tight">
            Make your{" "}
            <span className="bg-gradient-to-r from-[#9333EA] to-[#F89AEE] bg-clip-text text-transparent">
              study routine
            </span>{" "}
            easier
          </h2>
        </div>
        <div className="flex-1 md:flex md:justify-end">
          <p className="text-xl text-[#606060] w-full max-w-[500px] font-light">
            Designed to streamline your learning, these study tools offer
            simplified explanations, concise summaries, and clean layouts for
            faster reading and better focus.
          </p>
        </div>
      </div>

      <section className="flex items-center justify-between max-lg:justify-center flex-wrap gap-8">
        {data.map((d, idx) => (
          <SupportLearningItem {...d} key={idx} />
        ))}
      </section>
      <div className="pt-24 pb-48 flex justify-center">
        <Button
          title="Get started for free"
          size="large"
          onClick={handleTryForFree}
          endicon={<ArrowDiagonalRightIcon fill="#FFFFFF" />}
          className="!py-3 !px-8  !text-sm  !text-white !rounded-[50px] border border-[#2F004F] bg-[#2F004F] font-[600] "
        />
      </div>
    </Container>
  );
};

export default SupportLeaningContainer;
