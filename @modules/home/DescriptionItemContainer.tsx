import React, { FC } from "react";
import DescriptionItem from "./DescriptionItem";
import Container from "@/@shared/ui/Container";
import Button from "@/@shared/ui/Button";
import ArrowDiagonalRightIcon from "@/icons/ArrowDiagonalRightIcon";
import Link from "next/link";

interface Props {
  data: {
    title: string;
    body: string;
    imageSrc: string;
    imageAlt: string;
  }[];
}

const DescriptionItemContainer: FC<Props> = ({ data }) => {
  return (
    <Container>
      <section className="py-16 max-md:py-6">
        <div className="flex flex-col gap-36 max-md:gap-20">
          {data.map((item, idx) => (
            <DescriptionItem {...item} isEven={idx % 2 === 0} key={idx} />
          ))}
        </div>
        <div className="mx-auto mt-16 w-fit">
          <Link href={'/auth/signup'}>
            <Button
              title="Get Started"
              variant="outlined"
              size="large"
              endicon={<ArrowDiagonalRightIcon />}
            />
          </Link>
        </div>
      </section>
    </Container>
  );
};

export default DescriptionItemContainer;
