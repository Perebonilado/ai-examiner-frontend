import ResetPasswordForm from "@/@modules/auth/ResetPasswordForm";
import AppHead from "@/@shared/components/AppHead";
import { NextPage } from "next";
import React from "react";

const ResetPassword: NextPage = () => {
  return (
    <>
      <AppHead title="Reset Passord" />
      <ResetPasswordForm />
    </>
  );
};

export default ResetPassword;
