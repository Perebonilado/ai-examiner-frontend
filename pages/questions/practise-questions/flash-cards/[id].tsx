import FlashCardItem from "@/@modules/questions/FlashCardItem/FlashCardItem";
import FlashCardItemContainer from "@/@modules/questions/FlashCardItemContainer";
import AppHead from "@/@shared/components/AppHead";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";

const FlashCards: NextPage = () => {
  return (
    <>
      <AppHead title="Multiple Choice" />
      <AppLayout>
        <h1>Flash Cards</h1>

        <FlashCardItemContainer
          data={[
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
            { answer: "dsf", question: "dsf" },
          ]}
        />
      </AppLayout>
    </>
  );
};

export default FlashCards;
