import AccountHeader from "@/@modules/account/AccountHeader";
import CallCreditsContainer from "@/@modules/account/CallCreditsContainer";
import AppHead from "@/@shared/components/AppHead";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const CallCredits: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <AppHead title="Purchase Call Credits" />
      <AppLayout
        handleBack={() => {
          router.back();
        }}
        mobileTitle="Call credits"
      >
        <div className="mx-auto w-full max-w-[1000px]">
          <AccountHeader />
          <CallCreditsContainer />
        </div>
      </AppLayout>
    </>
  );
};

export default CallCredits;
