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
}

const SupportLeaningContainer: FC<Props> = ({ data }) => {
  return (
    <Container>
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mt-24 mb-16">
        <div className="flex-1">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Make your{" "}
            <span className="bg-gradient-to-r from-[#9333EA] to-[#F89AEE] bg-clip-text text-transparent">
              study routine easier
            </span>
          </h2>
        </div>
        <div className="flex-1 md:flex md:justify-end">
          <p className="text-base sm:text-lg text-[#606060] w-full max-w-[500px] font-light">
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
      <div className="py-24 flex justify-center">
        <Link href={"/pricing"}>
          <Button
            title="View pricing"
            size="large"
            endicon={<ArrowDiagonalRightIcon fill="#FFFFFF" />}
          />
        </Link>
      </div>
    </Container>
  );
};

export default SupportLeaningContainer;
