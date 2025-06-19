import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import FeatureSelectionItemContainer from "./FeatureSelectionItemContainer";
import Link from "next/link";
import Button from "@/@shared/ui/Button";
import ArrowDiagonalRightIcon from "@/icons/ArrowDiagonalRightIcon";

interface Props {
  handleTryForFree: () => void;
}

const FeatureDisplaySection: FC<Props> = ({ handleTryForFree }) => {
  return (
    <section>
      <Container>
        <div>
          <h2 className="text-5xl font-extrabold text-[#2F004F] text-center mb-14">
            <span className="bg-gradient-to-r from-[#9333EA] to-[#F89AEE] bg-clip-text text-transparent">
              Smart tests
            </span>{" "}
            to boost your grades
          </h2>
        </div>
      </Container>

      <FeatureSelectionItemContainer />

      <div className="py-24 flex justify-center">
        <Button
          title="Get started for free"
          size="large"
          onClick={handleTryForFree}
          endicon={<ArrowDiagonalRightIcon fill="#FFFFFF" />}
          className="!py-3 !px-8  !text-sm  !text-white !rounded-[50px] border border-[#2F004F] bg-[#2F004F] font-[600] "
        />
      </div>
    </section>
  );
};

export default FeatureDisplaySection;
