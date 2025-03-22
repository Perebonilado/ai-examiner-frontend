import CallCreditsContainer from "@/@modules/account/CallCreditsContainer";
import AppHead from "@/@shared/components/AppHead";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";

const CallCredits: NextPage = () => {
  return (
    <>
      <AppHead title="Purchase Call Credits" />
      <AppLayout>
        <CallCreditsContainer />
      </AppLayout>
    </>
  );
};

export default CallCredits;
