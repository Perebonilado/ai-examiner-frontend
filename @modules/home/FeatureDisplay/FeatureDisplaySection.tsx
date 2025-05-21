import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import FeatureSelectionItemContainer from "./FeatureSelectionItemContainer";

const FeatureDisplaySection: FC = () => {
  return (
    <section>
      <Container>
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#2F004F] text-center">
            <span className="text-[#9333EA]">Smart tests</span> to boost your
            grades
          </h2>
        </div>
      </Container>

      <FeatureSelectionItemContainer />
    </section>
  );
};

export default FeatureDisplaySection;
