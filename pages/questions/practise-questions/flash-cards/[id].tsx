import FlashCardItem from "@/@modules/questions/FlashCardItem/FlashCardItem";
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

        <div className="py-10 flex items-center justify-center">
          <FlashCardItem />
        </div>
      </AppLayout>
    </>
  );
};

export default FlashCards;
