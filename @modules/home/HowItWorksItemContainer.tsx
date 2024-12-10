import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import HowItWorksItem, { HowItWorksItemProps } from "./HowItWorksItem";
import Button from "@/@shared/ui/Button";
import ArrowDiagonalRightIcon from "@/icons/ArrowDiagonalRightIcon";
import Link from "next/link";

interface Props {
  data: HowItWorksItemProps[];
}

const HowItWorksItemContainer: FC<Props> = ({ data }) => {
  return (
    <Container>
      <h1 className="pb-24 pt-20 text-center text-4xl font-semibold text-[#2F004F]" id="how-it-works">How it works</h1>
      <section className="flex flex-col gap-28 pb-20 overflow-x-hidden">
        {data.map((d, idx) => (
          <HowItWorksItem {...d} key={idx} />
        ))}
      </section>
      <div className="pb-32 flex justify-center">
        <Link href={"/auth/login"}>
          <Button
            title="Get Started"
            size="large"
            endicon={<ArrowDiagonalRightIcon fill="#FFFFFF" />}
          />
        </Link>
      </div>
    </Container>
  );
};

export default HowItWorksItemContainer;
