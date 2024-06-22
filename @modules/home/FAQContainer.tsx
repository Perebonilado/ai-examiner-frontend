import Accordion from "@/@shared/components/Accordion";
import PatternsBg from "@/@shared/components/PatternsBg";
import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import faqData from "../../json-data/faq.json";

const FAQContainer: FC = () => {
  return (
    <section className="bg-[#D8CAFF33] pt-20">
      <Container>
        <h3 className="text-center text-3xl font-bold text-[#360B58]">
          Frequently asked questions
        </h3>
        <div className="py-16">
          <Accordion data={faqData} />
        </div>
      </Container>
      <PatternsBg />
    </section>
  );
};

export default FAQContainer;
