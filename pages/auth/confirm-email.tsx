import { NextPage } from "next";
import React from "react";
import AppHead from "@/@shared/components/AppHead";
import ConfirmEmail from "@/@modules/auth/ConfirmEmail";

const ConfirmEmailPage: NextPage = () => (
  <>
    <AppHead title="Confirm your email" />
    <ConfirmEmail />
  </>
);

export default ConfirmEmailPage;
