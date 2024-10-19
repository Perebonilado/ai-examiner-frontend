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
      <h2 className="text-[#2F004F] text-3xl font-semibold mb-14 max-lg:text-center">
        Support your learning with
      </h2>
      <section className="flex items-center justify-between max-lg:justify-center flex-wrap gap-8">
        {data.map((d, idx) => (
          <SupportLearningItem {...d} key={idx} />
        ))}
      </section>
      <div className="py-24 flex justify-center">
        <Link href={'/pricing'}>
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
